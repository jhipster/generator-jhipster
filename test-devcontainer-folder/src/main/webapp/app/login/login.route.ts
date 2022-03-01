import { Route } from '@angular/router';

import { LoginComponent } from './login.component';

export const LOGIN_ROUTE: Route = {
  path: '',
  component: LoginComponent,
  data: {
    pageTitle: 'Sign in',
  },
};
