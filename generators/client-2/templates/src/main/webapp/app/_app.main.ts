import { upgradeAdapter } from './upgrade_adapter';

upgradeAdapter.bootstrap(document.body, ['<%=angularAppName%>.app'], {strictDi: true});
