import { UpgradeAdapter } from "@angular/upgrade";
import { forwardRef } from '@angular/core';
import { <%=angularAppName%>AppModule } from './app.ng2module';

export var upgradeAdapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => <%=angularAppName%>AppModule));
