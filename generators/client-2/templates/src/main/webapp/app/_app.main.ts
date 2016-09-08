import { upgradeAdapter } from './upgrade_adapter';
import './app.module';

upgradeAdapter.bootstrap(document.body, ['<%=angularAppName%>.app'], {strictDi: true});
