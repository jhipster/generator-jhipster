import { Routes } from '@angular/router';
import { <%=jhiPrefixCapitalized%>GatewayComponent } from './gateway.component';

export const gatewayRoute: Routes = [
  {
    path: 'gateway',
    component: <%=jhiPrefixCapitalized%>GatewayComponent
  }
];
