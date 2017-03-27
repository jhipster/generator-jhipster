import { Route } from '@angular/router';

import { <%=jhiPrefixCapitalized%>MetricsMonitoringComponent } from './metrics.component';

export const metricsRoute: Route = {
  path: '<%=jhiPrefix%>-metrics',
  component: <%=jhiPrefixCapitalized%>MetricsMonitoringComponent,
  data: {
    pageTitle: 'metrics.title'
  }
};
