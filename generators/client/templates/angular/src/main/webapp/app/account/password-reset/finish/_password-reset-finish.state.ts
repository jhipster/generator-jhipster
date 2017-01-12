import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../../shared';
import { PasswordResetFinishComponent } from './password-reset-finish.component';

export const passwordResetFinishRoute: Routes = [
  {
    path: 'reset/finish',
    component: PasswordResetFinishComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [UserRouteAccessService]
  }
];
