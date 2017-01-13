import { Route } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>GatewayComponent } from './gateway.component';

export const gatewayRoute: Route = {
  path: 'gateway',
  component: <%=jhiPrefixCapitalized%>GatewayComponent,
  data: {
    authorities: ['ROLE_ADMIN'],
    pageTitle: 'gateway.title'
  },
  canActivate: [UserRouteAccessService]
};
