import { CanActivate, Routes } from '@angular/router';

import {SessionComponent} from './session.component';

export const sessionRoute: Routes = [
  {
    path: 'password',
    component: SessionComponent,
    canActivate: [SessionResolve]
  }
];