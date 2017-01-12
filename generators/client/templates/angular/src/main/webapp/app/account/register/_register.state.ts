import { Routes } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import {RegisterComponent} from './register.component';

export const registerRoute: Routes = [
  {
    path: 'register',
    component: RegisterComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [RouteCanActivate]
  }
];
