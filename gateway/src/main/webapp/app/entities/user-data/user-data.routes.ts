import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import UserDataResolve from './route/user-data-routing-resolve.service';

const userDataRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/user-data.component').then(m => m.UserDataComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/user-data-detail.component').then(m => m.UserDataDetailComponent),
    resolve: {
      userData: UserDataResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/user-data-update.component').then(m => m.UserDataUpdateComponent),
    resolve: {
      userData: UserDataResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/user-data-update.component').then(m => m.UserDataUpdateComponent),
    resolve: {
      userData: UserDataResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default userDataRoute;
