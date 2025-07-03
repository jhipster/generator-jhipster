import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import AuthorityResolve from './route/authority-routing-resolve.service';

const authorityRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/authority.component').then(m => m.AuthorityComponent),
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':name/view',
    loadComponent: () => import('./detail/authority-detail.component').then(m => m.AuthorityDetailComponent),
    resolve: {
      authority: AuthorityResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/authority-update.component').then(m => m.AuthorityUpdateComponent),
    resolve: {
      authority: AuthorityResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [UserRouteAccessService],
  },
];

export default authorityRoute;
