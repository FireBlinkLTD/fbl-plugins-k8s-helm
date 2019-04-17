import { suite, test } from 'mocha-typescript';
import { ActionSnapshot, ContextUtil, ChildProcessService } from 'fbl';
import * as assert from 'assert';

import { TestActionHandler } from '../../src/handlers';
import Container from 'typedi';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

@suite()
class TestActionHandlerTestSuite {
    @test()
    async failValidation(): Promise<void> {
        const actionHandler = new TestActionHandler();
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
        const actionHandler = new TestActionHandler();
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
    async testRelease(): Promise<void> {
        const childProcessService = Container.get(ChildProcessService);

        const options = {
            release: 'test-release',
            cleanup: true,
            debug: true,
            extra: ['--tiller-namespace', 'kube-system'],
        };

        const code = await childProcessService.exec(
            'helm',
            ['install', 'test/assets/helm/test', '--wait', '--name', options.release],
            '.',
        );

        assert.strictEqual(code, 0);
        
        const actionHandler = new TestActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        const processor = actionHandler.getProcessor(options, context, snapshot, {});

        await processor.validate();
        await processor.execute();
    }

    @test()
    async testNonExistingRelease(): Promise<void> {
        const options = {
            release: 'test-non-existing-release',
            cleanup: true,
            debug: true,
        };

        const actionHandler = new TestActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        const processor = actionHandler.getProcessor(options, context, snapshot, {});

        await processor.validate();
        await chai.expect(processor.execute()).to.be.rejected;
    }
}
