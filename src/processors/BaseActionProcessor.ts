import { ActionProcessor, ChildProcessService, FSUtil } from 'fbl';
import Container from 'typedi';

export abstract class BaseActionProcessor extends ActionProcessor {
    /**
     * Execute "helm" command
     * @param binary
     * @param {string[]} args
     * @param {string} wd
     * @return {Promise<IExecOutput>}
     */
    async execHelmCommand(
        args: string[],
        debug: boolean,
        binary?: string,
    ): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }> {
        binary = binary || 'helm';
        const childProcessService = Container.get(ChildProcessService);

        const stdout: string[] = [];
        const stderr: string[] = [];

        if (debug) {
            this.snapshot.log(`Running command "${binary} ${args.join(' ')}"`);
        }

        const code = await childProcessService.exec(binary, args, this.snapshot.wd, {
            stdout: (chunk: any) => {
                stdout.push(chunk.toString().trim());
            },
            stderr: (chunk: any) => {
                stderr.push(chunk.toString().trim());
            },
        });

        if (code !== 0 || debug) {
            this.snapshot.log('exit code: ' + code, true);

            /* istanbul ignore else */
            if (stdout) {
                this.snapshot.log('stdout: ' + stdout, true);
            }

            /* istanbul ignore else */
            if (stderr) {
                this.snapshot.log('sterr: ' + stderr, true);
            }
        }

        if (code !== 0) {
            throw new Error(`"helm ${args.join(' ')}" command failed.`);
        }

        return {
            code,
            stdout: stdout.join('\n'),
            stderr: stderr.join('\n'),
        };
    }

    /**
     * Push argument with value if value exists
     */
    protected pushWithValue(args: string[], name: string, value: any): void {
        if (value !== undefined) {
            args.push(name, value.toString());
        }
    }

    /**
     * Resolve path value and push it to args if provided
     */
    protected pushPathValue(args: string[], name: string, value: any): void {
        if (value !== undefined) {
            args.push(name, FSUtil.getAbsolutePath(value.toString(), this.snapshot.wd));
        }
    }

    /**
     * Push argument only if value is true
     */
    protected pushWithoutValue(args: string[], name: string, value: boolean): void {
        if (value) {
            args.push(name);
        }
    }

    /**
     * Push all values to args if provided
     */
    protected pushAll(args: string[], values?: string[]): void {
        if (values) {
            args.push(...values);
        }
    }
}
