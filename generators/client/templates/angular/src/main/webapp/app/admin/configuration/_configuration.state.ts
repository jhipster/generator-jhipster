import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration.component';

export const configurationRoute: Routes = [
  {
    path: '<%=jhiPrefix%>-configuration',
    component: <%=jhiPrefixCapitalized%>ConfigurationComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'configuration.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
