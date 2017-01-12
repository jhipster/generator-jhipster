import { Routes } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import { SessionsComponent } from './sessions.component';

export const sessionsRoute: Routes = [
  {
    path: 'sessions',
    component: SessionsComponent,
    data: { 
      authorities: ['ROLE_USER'] 
    },
    canActivate: [RouteCanActivate]
  }
];