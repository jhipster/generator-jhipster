import { upgradeAdapter } from './upgrade_adapter';
import { HTTP_PROVIDERS } from '@angular/http';
import './app.module';

upgradeAdapter.bootstrap(document.body, ['<%=angularAppName%>.app'], {strictDi: true});
upgradeAdapter.addProvider(HTTP_PROVIDERS);
