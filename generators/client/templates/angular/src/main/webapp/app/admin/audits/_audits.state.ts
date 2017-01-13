import { Route } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { AuditsComponent } from './audits.component';

export const auditsRoute: Route = {
  path: 'audits',
  component: AuditsComponent,
  data: {
    authorities: ['ROLE_ADMIN'],
    pageTitle: 'audits.title'
  },
  canActivate: [UserRouteAccessService]
};
