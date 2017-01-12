import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>MetricsMonitoringComponent } from './metrics.component';

export const metricsRoute: Routes = [
  {
    path: 'jhi-metrics',
    component: <%=jhiPrefixCapitalized%>MetricsMonitoringComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'metrics.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
