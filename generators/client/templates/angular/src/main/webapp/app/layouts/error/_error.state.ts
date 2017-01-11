import { ErrorComponent } from './error.component';
import { Routes } from '@angular/router';

export const errorRoute: Routes = [
  {
    path: 'error',
    component: ErrorComponent
  },
  {
    path: 'accessdenied',
    component: ErrorComponent
  }
];
