import { UpgradeAdapter } from '@angular/upgrade';
import { uiRouterNgUpgrade } from 'ui-router-ng1-to-ng2';
import { forwardRef } from '@angular/core';
import { <%=angular2AppName%>AppModule } from './app.ng2module';

export var upgradeAdapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => <%=angular2AppName%>AppModule));
uiRouterNgUpgrade.setUpgradeAdapter(upgradeAdapter);
