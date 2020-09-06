import {
    ActionHandler,
    ActionProcessor,
    IActionHandlerMetadata,
    IContext,
    ActionSnapshot,
    IDelegatedParameters,
} from 'fbl';
import { UpgradeOrInstallV2ActionProcessor } from '../processors';

export class UpgradeOrInstallV2ActionHandler extends ActionHandler {
    private static metadata = <IActionHandlerMetadata>{
        id: 'com.fireblink.fbl.plugins.k8s.helm.upgrade.v2',
        aliases: [
            'fbl.plugins.k8s.helm.upgrade.v2',
            'fbl.plugins.k8s.helm.install.v2',
            'k8s.helm.upgrade.v2',
            'k8s.helm.install.v2',
            'helm.upgrade.v2',
            'helm.install.v2',
        ],
    };

    /* istanbul ignore next */
    /**
     * @inheritdoc
     */
    getMetadata(): IActionHandlerMetadata {
        return UpgradeOrInstallV2ActionHandler.metadata;
    }

    /**
     * @inheritdoc
     */
    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UpgradeOrInstallV2ActionProcessor(options, context, snapshot, parameters);
    }
}
