import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health.component';
import { Principal } from '../../shared';

export const healthRoute: Routes = [
  {
    path: 'jhi-health',
    component: <%=jhiPrefixCapitalized%>HealthCheckComponent
  }
];
