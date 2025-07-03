import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import TagResolve from './route/tag-routing-resolve.service';

const tagRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/tag.component').then(m => m.TagComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/tag-detail.component').then(m => m.TagDetailComponent),
    resolve: {
      tag: TagResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/tag-update.component').then(m => m.TagUpdateComponent),
    resolve: {
      tag: TagResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/tag-update.component').then(m => m.TagUpdateComponent),
    resolve: {
      tag: TagResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default tagRoute;
