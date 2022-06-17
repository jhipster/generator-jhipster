import { Route } from '@angular/router';

import { GatewayComponent } from './gateway.component';

export const gatewayRoute: Route = {
  path: '',
  component: GatewayComponent,
  data: {
    pageTitle: 'gateway.title',
  },
};
