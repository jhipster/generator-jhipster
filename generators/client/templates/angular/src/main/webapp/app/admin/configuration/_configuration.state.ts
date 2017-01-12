import { Routes } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration.component';

export const configurationRoute: Routes = [
  {
    path: '<%=jhiPrefix%>-configuration',
    component: <%=jhiPrefixCapitalized%>ConfigurationComponent,
    data: { 
      authorities: ['ROLE_ADMIN'] 
    },
    canActivate: [RouteCanActivate]
  }
];
