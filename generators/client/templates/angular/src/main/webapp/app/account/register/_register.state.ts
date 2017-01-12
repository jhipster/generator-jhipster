import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { RegisterComponent } from './register.component';

export const registerRoute: Routes = [
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      authorities: [],
      pageTitle: 'register.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
