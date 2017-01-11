import { Routes, CanActivate } from '@angular/router';

import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration.component';

export const configurationRoute: Routes = [
  {
    path: '<%=jhiPrefix%>-configuration',
    component: <%=jhiPrefixCapitalized%>ConfigurationComponent,
    canActivate: [ConfigurationResolve]
  }
];
