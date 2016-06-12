import { UpgradeAdapter } from '@angular/upgrade';

export const upgradeAdapter = new UpgradeAdapter();

upgradeAdapter.bootstrap(document.body, ['<%=angularAppName%>.app'], {strictDi: true});
