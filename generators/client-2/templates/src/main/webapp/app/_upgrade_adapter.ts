import * as angular from 'angular';

import { UpgradeAdapter } from '@angular/upgrade';
import { forwardRef } from '@angular/core';
import { <%=angular2AppName%>AppModule } from './app.module';

export var upgradeAdapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => <%=angular2AppName%>AppModule));
