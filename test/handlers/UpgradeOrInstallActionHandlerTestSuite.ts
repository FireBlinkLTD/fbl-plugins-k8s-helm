import { suite, test } from 'mocha-typescript';
import { ActionSnapshot, ContextUtil, TempPathsRegistry, ChildProcessService } from 'fbl';
import * as assert from 'assert';
import { Container } from 'typedi';
import { APIRequestProcessor } from '@fireblink/k8s-api-client';

import { UpgradeOrInstallActionHandler } from '../../src/handlers';
import { dump } from 'js-yaml';
import { promisify } from 'util';
import { writeFile } from 'fs';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

@suite()
class UpgradeOrInstallActionHandlerTestSuite {
    async after(): Promise<void> {
        const releases: string[] = [];
        const childProcessService = Container.get(ChildProcessService);
        const code = await childProcessService.exec('helm', ['ls', '--short'], '.', {
            stdout: (chunk: any) => {
                let parts: string[] = chunk
                    .toString()
                    .trim()
                    .split('\n');
                parts = parts.map(p => p.trim()).filter(p => p.length > 0);

                releases.push(...parts);
            },
        });

        if (code !== 0) {
            throw new Error('Unable to list helm charts');
        }

        if (releases.length > 0) {
            console.log('-> Removing releases:', releases);
            await childProcessService.exec('helm', ['delete', '--purge', ...releases], '.');
        }

        await Container.get(TempPathsRegistry).cleanup();
        Container.reset();
    }

    @test()
    async failValidation(): Promise<void> {
        const actionHandler = new UpgradeOrInstallActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        await chai.expect(actionHandler.getProcessor([], context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(actionHandler.getProcessor({}, context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(actionHandler.getProcessor(123, context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(actionHandler.getProcessor('test', context, snapshot, {}).validate()).to.be.rejected;

        await chai.expect(
            actionHandler
                .getProcessor(
                    {
                        release: 'release',
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
        const actionHandler = new UpgradeOrInstallActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        await actionHandler
            .getProcessor(
                {
                    release: 'release',
                    chart: 'chart',
                },
                context,
                snapshot,
                {},
            )
            .validate();
    }

    @test()
    async installAndUpdateLocalChart(): Promise<void> {
        const actionHandler = new UpgradeOrInstallActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        const options: any = {
            chart: 'test/assets/helm/test',
            release: 'ftpo-iu-1',
            wait: true,
            timeout: 100,
        };

        let processor = actionHandler.getProcessor(options, context, snapshot, {});

        await processor.validate();
        await processor.execute();

        const api = new APIRequestProcessor();
        const pods = await api.getAll('/api/v1/namespaces/default/pods');
        const pod = pods.items.find(p => p.metadata.name.indexOf(options.release) >= 0);

        assert(pod);

        // Update Release
        options.variables = {
            inline: {
                env: [
                    {
                        name: 'TEST',
                        value: 'TST',
                    },
                ],
            }            
        };
        
        options.wait = false;
        options.extra = [
            '--debug'
        ];

        processor = actionHandler.getProcessor(options, context, snapshot, {});

        await processor.validate();
        await processor.execute();

        const newPods = await api.getAll('/api/v1/namespaces/default/pods');
        const filteredPods = newPods.items.filter(p => p.metadata.name.indexOf(options.release) >= 0);

        assert.strictEqual(filteredPods.length, 2);
        assert.strictEqual(filteredPods[0].metadata.labels.app, filteredPods[1].metadata.labels.app);
        assert.strictEqual(filteredPods[0].metadata.labels.release, filteredPods[1].metadata.labels.release);
    }    

    @test()
    async failToInstallMissingChart(): Promise<void> {
        const actionHandler = new UpgradeOrInstallActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        const options = {
            chart: 'non-existing/test',
            release: 'remote-test-1'           
        };

        const processor = actionHandler.getProcessor(options, context, snapshot, {});

        await processor.validate();
        await chai.expect(processor.execute()).to.be.rejectedWith('"helm upgrade --install remote-test-1 non-existing/test" command failed');
    }

    @test()
    async installChartFromRepository(): Promise<void> {
        const actionHandler = new UpgradeOrInstallActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        const options = {
            chart: 'localhost/test',
            release: 'remote-test-1',
            wait: true,
            timeout: 100,
            variables: {
                inline: {
                    env: [
                        {
                            name: 'TEST',
                            value: 'TST',
                        },
                    ],
                },
            },
            debug: true
        };

        const processor = actionHandler.getProcessor(options, context, snapshot, {});

        await processor.validate();
        await processor.execute();

        const api = new APIRequestProcessor();
        const pods = await api.getAll('/api/v1/namespaces/default/pods');
        const pod = pods.items.find(p => p.metadata.name.indexOf(options.release) >= 0);

        assert(pod);
    }

    @test()
    async installChartFromRepositoryWithVariablesFromFile(): Promise<void> {
        const tempPathsRegistry = Container.get(TempPathsRegistry);

        const actionHandler = new UpgradeOrInstallActionHandler();
        const context = ContextUtil.generateEmptyContext();
        const snapshot = new ActionSnapshot('.', {}, '', 0, {});

        const variables = dump({
            env: [
                {
                    name: 'TEST',
                    value: 'TST',
                },
            ],
        });
        const variablesFile = await tempPathsRegistry.createTempFile();
        await promisify(writeFile)(variablesFile, variables);

        const options = {
            chart: 'localhost/test',
            release: 'remote-test-1',
            wait: true,
            timeout: 100,
            variables: {
                files: [variablesFile],
            },
        };

        const processor = actionHandler.getProcessor(options, context, snapshot, {});

        await processor.validate();
        await processor.execute();

        const api = new APIRequestProcessor();
        const pods = await api.getAll('/api/v1/namespaces/default/pods');
        const pod = pods.items.find(p => p.metadata.name.indexOf(options.release) >= 0);

        assert(pod);
    }
}
