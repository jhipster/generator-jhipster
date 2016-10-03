import { UpgradeAdapterRef } from '@angular/upgrade';
import { upgradeAdapter } from './upgrade_adapter';
import { UrlRouter } from 'ui-router-ng2';
import './app.module';

function readyFn(ref: UpgradeAdapterRef) {
    let $urlRouter = ref.ng2Injector.get(UrlRouter);
    $urlRouter.listen();
    $urlRouter.sync();
}

upgradeAdapter.bootstrap(document.body, ['<%=angularAppName%>.app'], {strictDi: true}).ready(readyFn);
