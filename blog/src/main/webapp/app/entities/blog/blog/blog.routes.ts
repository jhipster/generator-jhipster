import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import BlogResolve from './route/blog-routing-resolve.service';

const blogRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/blog.component').then(m => m.BlogComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/blog-detail.component').then(m => m.BlogDetailComponent),
    resolve: {
      blog: BlogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/blog-update.component').then(m => m.BlogUpdateComponent),
    resolve: {
      blog: BlogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/blog-update.component').then(m => m.BlogUpdateComponent),
    resolve: {
      blog: BlogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default blogRoute;
