import { Route } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>MetricsMonitoringComponent } from './metrics.component';

export const metricsRoute: Route = {
  path: 'jhi-metrics',
  component: <%=jhiPrefixCapitalized%>MetricsMonitoringComponent,
  data: {
    pageTitle: 'metrics.title'
  }
};
