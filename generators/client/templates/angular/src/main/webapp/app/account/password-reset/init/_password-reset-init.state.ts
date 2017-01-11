import { PasswordResetInitComponent } from './password-reset-init.component';
import { Routes } from '@angular/router';

export const passwordResetInitRoute: Routes = [
  {
    path: 'reset/request',
    component: PasswordResetInitComponent
  }
];
