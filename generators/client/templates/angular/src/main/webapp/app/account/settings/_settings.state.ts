import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import {SettingsComponent} from './settings.component';

export const settingsRoute: Routes = [
  {
    path: 'settings',
    component: SettingsComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.menu.account.settings
    },
    canActivate: [UserRouteAccessService]
  }
];
