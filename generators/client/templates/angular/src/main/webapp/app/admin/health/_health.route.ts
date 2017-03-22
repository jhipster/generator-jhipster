import { Route } from '@angular/router';

import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health.component';

export const healthRoute: Route = {
  path: '<%=jhiPrefix%>-health',
  component: <%=jhiPrefixCapitalized%>HealthCheckComponent,
  data: {
    pageTitle: 'health.title'
  }
};
