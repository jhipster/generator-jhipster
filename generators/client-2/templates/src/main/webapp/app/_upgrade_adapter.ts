import * as angular from 'angular';

import { UpgradeAdapter } from '@angular/upgrade';
import { forwardRef } from '@angular/core';
import { <%=angular2AppName%>AppModule } from './app.ng2module';

export var upgradeAdapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => <%=angular2AppName%>AppModule));
upgradeAdapter.upgradeNg1Provider('$stateParams');
upgradeAdapter.upgradeNg1Provider('$uibModal');
upgradeAdapter.upgradeNg1Provider('$state');
upgradeAdapter.upgradeNg1Provider('$rootScope');
<%_ if (enableTranslation) { _%>
upgradeAdapter.upgradeNg1Provider('tmhDynamicLocale');
<%_ } _%>
