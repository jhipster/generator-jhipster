import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { ActivateComponent } from './activate.component';

export const activateRoute: Routes = [
  {
    path: 'activate',
    component: ActivateComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [UserRouteAccessService]
  }
];
