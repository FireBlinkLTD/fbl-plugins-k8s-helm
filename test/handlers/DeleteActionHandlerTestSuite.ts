import { suite, test } from 'mocha-typescript';
import { ActionSnapshot, ContextUtil, TempPathsRegistry, ChildProcessService } from 'fbl';
import * as assert from 'assert';
import { Container } from 'typedi';
import { APIRequestProcessor } from '@fireblink/k8s-api-client';

import { DeleteActionHandler } from '../../src/handlers';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

@suite()
class DeleteActionHandlerTestSuite {
    @test()
    async failValidation(): Promise<void> {
        const actionHandler = new DeleteActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        await chai.expect(actionHandler.getProcessor([], context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(actionHandler.getProcessor({}, context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(actionHandler.getProcessor(123, context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(actionHandler.getProcessor('test', context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(actionHandler.getProcessor({}, context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(
            actionHandler
                .getProcessor(
                    {
                        chart: 'chart',
                    },
                    context,
                    snapshot,
                    {},
                )
                .validate(),
        ).to.be.rejected;
    }

    @test()
    async passValidation(): Promise<void> {
        const actionHandler = new DeleteActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        await actionHandler
            .getProcessor(
                {
                    release: 'release',
                },
                context,
                snapshot,
                {},
            )
            .validate();
    }

    @test()
    async deleteRelease(): Promise<void> {
        const childProcessService = Container.get(ChildProcessService);

        const options = {
            release: 'test-del',
            purge: true,
            debug: true,
            extra: ['--tiller-namespace', 'kube-system'],
        };

        const code = await childProcessService.exec(
            'helm',
            ['install', 'test/assets/helm/test', '--wait', '--name', options.release],
            '.',
        );

        assert.strictEqual(code, 0);

        const actionHandler = new DeleteActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        const processor = actionHandler.getProcessor(options, context, snapshot, {});

        await processor.validate();
        await processor.execute();

        let pod: any;
        for (let i = 0; i < 30; i++) {
            await new Promise(res => setTimeout(res, 1000));

            const api = new APIRequestProcessor();
            const pods = await api.getAll('/api/v1/namespaces/default/pods');
            pod = pods.items.find(p => p.metadata.name.indexOf(options.release) >= 0);

            if (!pod) {
                break;
            }
        }

        assert(!pod);
    }

    @test()
    async deleteNonExistingRelease(): Promise<void> {
        const childProcessService = Container.get(ChildProcessService);

        const options = {
            release: 'test-del-non-existing',
            purge: true,
            debug: true,
        };

        const actionHandler = new DeleteActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        const processor = actionHandler.getProcessor(options, context, snapshot, {});

        await processor.validate();
        await chai.expect(processor.execute()).to.be.rejected;
    }
}
