import {
    ActionHandler,
    ActionProcessor,
    IActionHandlerMetadata,
    IContext,
    ActionSnapshot,
    IDelegatedParameters,
} from 'fbl';
import { DeleteActionProcessor } from '../processors';

export class DeleteActionHandler extends ActionHandler {
    private static metadata = <IActionHandlerMetadata>{
        id: 'com.fireblink.fbl.plugins.k8s.helm.delete',
        aliases: ['fbl.plugins.k8s.helm.delete', 'k8s.helm.delete', 'helm.delete', 'helm.del'],
    };

    /* istanbul ignore next */
    /**
     * @inheritdoc
     */
    getMetadata(): IActionHandlerMetadata {
        return DeleteActionHandler.metadata;
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
        return new DeleteActionProcessor(options, context, snapshot, parameters);
    }
}
