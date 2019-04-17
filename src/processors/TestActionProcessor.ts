import * as Joi from 'joi';
import { BaseActionProcessor } from './BaseActionProcessor';

export class TestActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        // release name
        release: Joi.string().required(),

        // delete test pods upon completion
        cleanup: Joi.boolean(),

        // time in seconds to wait for any individual Kubernetes operation (like Jobs for hooks) (default 300)
        timeout: Joi.number()
            .integer()
            .min(0)
            .max(60 * 60), // 1h deployment limit

        // enable verbose output
        debug: Joi.boolean(),

        // extra arguments to append to the command
        // refer to `helm help upgrade` for all available options
        extra: Joi.array().items(Joi.string()),
    })
        .required()
        .options({ abortEarly: true });

    /**
     * @inheritdoc
     */

    getValidationSchema(): Joi.SchemaLike | null {
        return TestActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        this.snapshot.log(`Testing release ${this.options.release}`);

        const args = this.prepareCLIArgs();
        const result = await this.execHelmCommand(args);

        if (result.code !== 0 || this.options.debug) {
            this.snapshot.log('exit code: ' + result.code, true);

            if (result.stdout) {
                this.snapshot.log('stdout: ' + result.stdout, true);
            }

            if (result.stderr) {
                this.snapshot.log('sterr: ' + result.stderr, true);
            }
        }

        if (result.code !== 0) {
            throw new Error(`"helm test ${this.options.release}" command failed.`);
        }
    }

    /**
     * Prepare CLI args
     */
    private prepareCLIArgs(): string[] {
        const args: string[] = ['test'];

        this.pushWithValue(args, '--timeout', this.options.timeout);
        this.pushWithoutValue(args, '--cleanup', this.options.cleanup);
        this.pushWithoutValue(args, '--debug', this.options.debug);

        if (this.options.extra) {
            args.push(...this.options.extra);
        }

        args.push(this.options.release);

        return args;
    }
}
