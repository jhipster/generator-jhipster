import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { PasswordComponent } from './password.component';

export const passwordRoute: Routes = [
  {
    path: 'password',
    component: PasswordComponent,
    data: { 
      authorities: ['ROLE_USER'] 
    },
    canActivate: [UserRouteAccessService]
  }
];
