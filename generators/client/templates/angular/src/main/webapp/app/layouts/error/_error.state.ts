import { Routes } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import { ErrorComponent } from './error.component';

export const errorRoute: Routes = [
  {
    path: 'error',
    component: ErrorComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [RouteCanActivate]
  },
  {
    path: 'accessdenied',
    component: ErrorComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [RouteCanActivate]
  }
];
