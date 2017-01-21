import { Route } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health.component';

export const healthRoute: Route = {
  path: 'jhi-health',
  component: <%=jhiPrefixCapitalized%>HealthCheckComponent,
  data: {
    pageTitle: 'health.title'
  }
};
