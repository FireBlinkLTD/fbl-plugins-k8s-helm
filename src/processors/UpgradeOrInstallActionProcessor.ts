import { FSUtil, TempPathsRegistry, FlowService, ContextUtil } from 'fbl';
import * as Joi from 'joi';
import { promisify } from 'util';
import { writeFile, exists } from 'fs';
import { dump, load } from 'js-yaml';

import { BaseActionProcessor } from './BaseActionProcessor';

const writeFileAsync = promisify(writeFile);
const existsAsync = promisify(exists);

export class UpgradeOrInstallActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        // custom helm v2 binary name or path
        binary: Joi.string().optional(),

        // release name
        release: Joi.string().required(),

        // chart name or local path
        chart: Joi.string().required(),

        // specify the exact chart version to use. If this is not specified, the latest version is used
        version: Joi.string(),

        // K8s namespace
        namespace: Joi.string(),

        // variables to pass for the helm chart
        variables: Joi.object({
            inline: Joi.any(),
            files: Joi.array().items(Joi.string()),
            templates: Joi.array().items(Joi.string()),
        }),

        // force resource update through delete/recreate if needed
        force: Joi.boolean(),

        // if set, will wait until all Pods, PVCs, Services, and minimum number of Pods of a Deployment are in a ready state before marking the release as successful. It will wait for as long as `timeout`
        wait: Joi.boolean(),

        // time in seconds to wait for any individual Kubernetes operation (like Jobs for hooks) (default 300)
        timeout: Joi.number()
            .integer()
            .min(0)
            .max(60 * 60), // 1h deployment limit

        // print debug statement
        debug: Joi.boolean(),

        // extra arguments to append to the command
        // refer to `helm help upgrade` for all available options
        extra: Joi.array().items(Joi.string()),
    })
        .required()
        .options({ abortEarly: true, allowUnknown: false });

    /**
     * @inheritdoc
     */

    getValidationSchema(): Joi.Schema | null {
        return UpgradeOrInstallActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        this.snapshot.log(
            `Upgrading or installing release ${this.options.release} of helm chart ${this.options.chart}@${
                this.options.version || 'latest'
            }`,
        );

        const args = await this.prepareCLIArgs();
        await this.execHelmCommand(args, this.options.debug, this.options.binary);
    }

    /**
     * Prepare CLI args
     */
    private async prepareCLIArgs(): Promise<string[]> {
        const tempPathsRegistry = TempPathsRegistry.instance;
        const flowService = FlowService.instance;

        const args: string[] = ['upgrade', '--install'];

        this.pushWithValue(args, '--namespace', this.options.namespace);
        this.pushWithValue(args, '--timeout', this.options.timeout && this.options.timeout + 's');
        this.pushWithValue(args, '--version', this.options.version);

        this.pushWithoutValue(args, '--wait', this.options.wait);
        this.pushWithoutValue(args, '--force', this.options.force);
        this.pushWithoutValue(args, '--debug', this.options.debug);

        if (this.options.variables) {
            if (this.options.variables.files) {
                this.options.variables.files.forEach((f: string) => {
                    this.pushPathValue(args, '-f', f);
                });
            }

            if (this.options.variables.templates) {
                for (const templatePath of this.options.variables.templates) {
                    const absolutePath = FSUtil.getAbsolutePath(templatePath, this.snapshot.wd);
                    let fileContent: string = await FSUtil.readTextFile(absolutePath);

                    // resolve global template
                    fileContent = await flowService.resolveTemplate(
                        this.context.ejsTemplateDelimiters.global,
                        fileContent,
                        this.context,
                        this.snapshot,
                        this.parameters,
                    );

                    let fileContentObject = load(fileContent);

                    // resolve local template
                    fileContentObject = await flowService.resolveOptionsWithNoHandlerCheck(
                        this.context.ejsTemplateDelimiters.local,
                        fileContentObject,
                        this.context,
                        this.snapshot,
                        this.parameters,
                        false,
                    );

                    // resolve references
                    fileContentObject = ContextUtil.resolveReferences(fileContentObject, this.context, this.parameters);

                    const filePath = await tempPathsRegistry.createTempFile();
                    await writeFileAsync(filePath, dump(fileContentObject), 'utf8');
                    this.pushPathValue(args, '-f', filePath);
                }
            }

            if (this.options.variables.inline) {
                const tmpFile = await tempPathsRegistry.createTempFile(false, '.yml');
                const yml = dump(this.options.variables.inline);
                await writeFileAsync(tmpFile, yml, 'utf8');
                this.pushPathValue(args, '-f', tmpFile);
            }
        }

        this.pushAll(args, this.options.extra);

        args.push(this.options.release);

        const localPath = FSUtil.getAbsolutePath(this.options.chart, this.snapshot.wd);
        const existsLocally = await existsAsync(localPath);

        if (existsLocally) {
            args.push(localPath);
        } else {
            args.push(this.options.chart);
        }

        return args;
    }
}
