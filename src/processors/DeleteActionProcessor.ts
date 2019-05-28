import * as Joi from 'joi';
import { BaseActionProcessor } from './BaseActionProcessor';

export class DeleteActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        // release name
        release: Joi.string().required(),

        // remove the release from the store and make its name free for later use
        purge: Joi.boolean(),

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
        return DeleteActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        this.snapshot.log(`Deleting release ${this.options.release}`);

        const args = this.prepareCLIArgs();
        await this.execHelmCommand(args, this.options.debug);
    }

    /**
     * Prepare CLI args
     */
    private prepareCLIArgs(): string[] {
        const args: string[] = ['delete'];

        this.pushWithValue(args, '--timeout', this.options.timeout);
        this.pushWithoutValue(args, '--purge', this.options.purge);
        this.pushWithoutValue(args, '--debug', this.options.debug);

        if (this.options.extra) {
            args.push(...this.options.extra);
        }

        args.push(this.options.release);

        return args;
    }
}
