import { Routes } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health.component';

export const healthRoute: Routes = [
  {
    path: 'jhi-health',
    component: <%=jhiPrefixCapitalized%>HealthCheckComponent,
    data: { 
      authorities: ['ROLE_ADMIN'] 
    },
    canActivate: [RouteCanActivate]
  }
];
