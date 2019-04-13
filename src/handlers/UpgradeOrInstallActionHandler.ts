import {
    ActionHandler,
    ActionProcessor,
    IActionHandlerMetadata,
    IContext,
    ActionSnapshot,
    IDelegatedParameters,
} from 'fbl';
import { UpgradeOrInstallActionProcessor } from '../processors';

export class UpgradeOrInstallActionHandler extends ActionHandler {
    private static metadata = <IActionHandlerMetadata>{
        id: 'com.fireblink.fbl.plugins.k8s.helm.upgrade',
        aliases: [
            'fbl.plugins.k8s.helm.upgrade',
            'fbl.plugins.k8s.helm.install',
            'k8s.helm.upgrade',
            'k8s.helm.install',
            'helm.upgrade',
            'helm.install',
        ],
    };

    /* istanbul ignore next */
    /**
     * @inheritdoc
     */
    getMetadata(): IActionHandlerMetadata {
        return UpgradeOrInstallActionHandler.metadata;
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
        return new UpgradeOrInstallActionProcessor(options, context, snapshot, parameters);
    }
}
