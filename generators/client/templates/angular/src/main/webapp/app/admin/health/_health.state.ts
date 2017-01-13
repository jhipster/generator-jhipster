import { Route } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health.component';

export const healthRoute: Route = {
  path: 'jhi-health',
  component: <%=jhiPrefixCapitalized%>HealthCheckComponent,
  data: {
    authorities: ['ROLE_ADMIN'],
    pageTitle: 'health.title'
  },
  canActivate: [UserRouteAccessService]
};
