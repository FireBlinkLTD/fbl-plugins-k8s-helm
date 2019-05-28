import { ActionProcessor, ChildProcessService } from 'fbl';
import Container from 'typedi';

export abstract class BaseActionProcessor extends ActionProcessor {
    /**
     * Execute "helm" command
     * @param {string[]} args
     * @param {string} wd
     * @return {Promise<IExecOutput>}
     */
    async execHelmCommand(
        args: string[],
        debug: boolean,
    ): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }> {
        const childProcessService = Container.get(ChildProcessService);

        const stdout: string[] = [];
        const stderr: string[] = [];

        if (debug) {
            this.snapshot.log(`Running command "helm ${args.join(' ')}"`);
        }

        const code = await childProcessService.exec('helm', args, this.snapshot.wd, {
            stdout: (chunk: any) => {
                stdout.push(chunk.toString().trim());
            },
            stderr: (chunk: any) => {
                stderr.push(chunk.toString().trim());
            },
        });

        if (code !== 0 || debug) {
            this.snapshot.log('exit code: ' + code, true);

            if (stdout) {
                this.snapshot.log('stdout: ' + stdout, true);
            }

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
     * Push argument only if value is true
     */
    protected pushWithoutValue(args: string[], name: string, value: boolean): void {
        if (value) {
            args.push(name);
        }
    }
}
