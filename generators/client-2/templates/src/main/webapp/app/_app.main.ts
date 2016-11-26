import { UpgradeAdapterRef } from '@angular/upgrade';
import { upgradeAdapter } from './upgrade_adapter';
import { UrlRouter } from 'ui-router-ng2';

import '../vendor/bootstrap/dist/css/bootstrap.css!';
import '../vendor/font-awesome/css/font-awesome.min.css!';

import './app.module';

function readyFn(ref: UpgradeAdapterRef) {
    let $urlRouter = ref.ng2Injector.get(UrlRouter);
    $urlRouter.listen();
    $urlRouter.sync();
}

upgradeAdapter.bootstrap(document.body, ['<%=angularAppName%>.app'], {strictDi: true}).ready(readyFn);
