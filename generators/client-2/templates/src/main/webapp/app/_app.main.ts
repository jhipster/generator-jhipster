import { upgradeAdapter } from './upgrade_adapter';
import { HTTP_PROVIDERS } from '@angular/http';
import './app.module';

upgradeAdapter.addProvider(HTTP_PROVIDERS);
upgradeAdapter.bootstrap(document.body, ['<%=angularAppName%>.app'], {strictDi: true});
