import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health.component';

export const healthRoute: Routes = [
  {
    path: 'jhi-health',
    component: <%=jhiPrefixCapitalized%>HealthCheckComponent,
    data: { 
      authorities: ['ROLE_ADMIN'] 
    },
    canActivate: [UserRouteAccessService]
  }
];
