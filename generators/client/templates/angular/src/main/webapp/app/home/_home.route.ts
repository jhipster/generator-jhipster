import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../shared';
import { HomeComponent } from './';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      authorities: [],
      pageTitle: 'home.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
