import { IPlugin } from 'fbl';
import { UpgradeOrInstallActionHandler, DeleteActionHandler } from './src/handlers';

const packageJson = require('../package.json');

module.exports = <IPlugin>{
    name: packageJson.name,
    description: packageJson.description,
    tags: packageJson.keywords,
    version: packageJson.version,

    requires: {
        fbl: packageJson.peerDependencies.fbl,
        plugins: {
            // pluginId: '<0.0.1'
        },
        applications: ['helm'],
    },

    reporters: [],

    actionHandlers: [new DeleteActionHandler(), new UpgradeOrInstallActionHandler()],

    templateUtils: [],
};
