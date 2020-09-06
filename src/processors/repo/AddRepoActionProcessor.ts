import * as Joi from 'joi';
import { BaseActionProcessor } from '../BaseActionProcessor';

export class AddRepoActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        name: Joi.string().required(),
        url: Joi.string().required(),

        noUpdate: Joi.boolean(),

        username: Joi.string(),
        password: Joi.string(),
        ca: Joi.string(),
        cert: Joi.string(),

        // enable verbose output
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
        return AddRepoActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { name, url, debug } = this.options;
        this.snapshot.log(`Adding repo ${name} ${url}`);

        const args = this.prepareCLIArgs();
        await this.execHelmCommand(args, debug);
    }

    /**
     * Prepare CLI args
     */
    private prepareCLIArgs(): string[] {
        const args: string[] = ['repo', 'add'];

        this.pushWithValue(args, '--username', this.options.username);
        this.pushWithValue(args, '--password', this.options.password);

        this.pushPathValue(args, '--ca-file', this.options.ca);
        this.pushPathValue(args, '--cert-file', this.options.cert);

        this.pushWithoutValue(args, '--no-update', this.options.noUpdate);
        this.pushWithoutValue(args, '--debug', this.options.debug);

        this.pushAll(args, this.options.extra);

        args.push(this.options.name);
        args.push(this.options.url);

        return args;
    }
}
