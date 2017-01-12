import { Routes } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import {SettingsComponent} from './settings.component';

export const settingsRoute: Routes = [
  {
    path: 'settings',
    component: SettingsComponent,
    data: { 
      authorities: ['ROLE_USER'] 
    },
    canActivate: [RouteCanActivate]
  }
];
