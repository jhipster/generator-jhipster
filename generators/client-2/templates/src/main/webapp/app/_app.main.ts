import { UpgradeAdapterRef } from "@angular/upgrade";
import { upgradeAdapter } from './upgrade_adapter';
import './app.module';

function readyFn(ref: UpgradeAdapterRef) {
    let $urlRouter = ref.ng1Injector.get('$urlRouter');
    $urlRouter.listen();
    $urlRouter.sync();
}

upgradeAdapter.bootstrap(document.body, ['<%=angularAppName%>.app'], {strictDi: true}).ready(readyFn);
