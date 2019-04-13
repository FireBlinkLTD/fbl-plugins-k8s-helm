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
    ): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }> {
        const childProcessService = Container.get(ChildProcessService);

        const stdout: string[] = [];
        const stderr: string[] = [];

        const code = await childProcessService.exec('helm', args, this.snapshot.wd, {
            stdout: (chunk: any) => {
                stdout.push(chunk.toString().trim());
            },
            stderr: (chunk: any) => {
                stderr.push(chunk.toString().trim());
            },
        });

        return {
            code,
            stdout: stdout.join('\n'),
            stderr: stderr.join('\n'),
        };
    }
}
