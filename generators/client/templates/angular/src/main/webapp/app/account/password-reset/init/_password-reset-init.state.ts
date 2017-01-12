<<<<<<< HEAD
import { PasswordResetInitComponent } from './password-reset-init.component';
=======
>>>>>>> fixes and normalizing the router
import { Routes } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import { PasswordResetInitComponent } from './password-reset-init.component';

export const passwordResetInitRoute: Routes = [
  {
    path: 'reset/request',
    component: PasswordResetInitComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [RouteCanActivate]
  }
];
