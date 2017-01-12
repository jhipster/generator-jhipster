import { Routes, CanActivate } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import { LogsComponent } from './logs.component';

export const logsRoute: Routes = [
  {
    path: 'logs',
    component: LogsComponent,
    data: { 
      authorities: ['ROLE_ADMIN'] 
    },
    canActivate: [RouteCanActivate]
  }
];
