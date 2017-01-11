import { Routes, CanActivate } from '@angular/router';

import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health.component';

export const healthRoute: Routes = [
  {
    path: 'jhi-health',
    component: <%=jhiPrefixCapitalized%>HealthCheckComponent,
    canActivate: [HealthResolve]
  }
];
