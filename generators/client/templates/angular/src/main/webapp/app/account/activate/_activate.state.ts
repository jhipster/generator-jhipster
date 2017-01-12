import { Routes } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import { ActivateComponent } from './activate.component';

export const activateRoute: Routes = [
  {
    path: 'activate',
    component: ActivateComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [RouteCanActivate]
  }
];
