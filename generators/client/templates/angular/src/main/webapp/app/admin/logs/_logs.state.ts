import { Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { LogsComponent } from './logs.component';

export const logsRoute: Routes = [
  {
    path: 'logs',
    component: LogsComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'logs.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
