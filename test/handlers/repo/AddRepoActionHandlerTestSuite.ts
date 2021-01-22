import { suite, test } from 'mocha-typescript';
import { ActionSnapshot, ContextUtil, ChildProcessService } from 'fbl';
import { AddRepoActionHandler } from '../../../src/handlers';
import * as assert from 'assert';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

@suite()
class AddRepoActionHandlerTestSuite {
    @test()
    async failValidation(): Promise<void> {
        const actionHandler = new AddRepoActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('index.yml', '.', {}, '', 0, {});

        await chai.expect(actionHandler.getProcessor([], context, snapshot, {}).validate()).to.be.rejected;
        await chai.expect(actionHandler.getProcessor({}, context, snapshot, {}).validate()).to.be.rejected;
        await chai.expect(actionHandler.getProcessor(123, context, snapshot, {}).validate()).to.be.rejected;
        await chai.expect(actionHandler.getProcessor('test', context, snapshot, {}).validate()).to.be.rejected;
        await chai.expect(actionHandler.getProcessor({}, context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(
            actionHandler
                .getProcessor(
                    {
                        name: 'test',
                    },
                    context,
                    snapshot,
                    {},
                )
                .validate(),
        ).to.be.rejected;

        await chai.expect(
            actionHandler
                .getProcessor(
                    {
                        url: 'test',
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
        const actionHandler = new AddRepoActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('index.yml', '.', {}, '', 0, {});

        await actionHandler
            .getProcessor(
                {
                    name: 'test',
                    url: 'http://localhost:8000',
                },
                context,
                snapshot,
                {},
            )
            .validate();
    }

    @test()
    async addRepo(): Promise<void> {
        const childProcessService = ChildProcessService.instance;

        const actionHandler = new AddRepoActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('index.yml', '.', {}, '', 0, {});

        const processor = actionHandler.getProcessor(
            {
                name: 'jetstack',
                url: 'https://charts.jetstack.io',
            },
            context,
            snapshot,
            {},
        );

        await processor.validate();
        await processor.execute();

        let result = '';
        await childProcessService.exec('helm', ['search', 'repo', 'jetstack/cert-manager'], '.', {
            stdout: (chunk: any) => {
                result += chunk.toString();
            },
        });

        assert(result.indexOf('NAME') === 0);
    }
}
