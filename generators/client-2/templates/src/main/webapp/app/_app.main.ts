import { UpgradeAdapterRef } from '@angular/upgrade';
import { upgradeAdapter } from './upgrade_adapter';
import { UrlRouter } from 'ui-router-ng2';
import './app.ng1module';

upgradeAdapter.bootstrap(document.body, ['<%=angularAppName%>.app'], {strictDi: true});
