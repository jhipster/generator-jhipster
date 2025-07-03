import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import NotificationResolve from './route/notification-routing-resolve.service';

const notificationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/notification.component').then(m => m.NotificationComponent),
    data: {
      defaultSort: `id,${ASC}`,
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/notification-detail.component').then(m => m.NotificationDetailComponent),
    resolve: {
      notification: NotificationResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/notification-update.component').then(m => m.NotificationUpdateComponent),
    resolve: {
      notification: NotificationResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/notification-update.component').then(m => m.NotificationUpdateComponent),
    resolve: {
      notification: NotificationResolve,
    },
    data: {
      authorities: ['ROLE_ADMIN'],
    },
    canActivate: [UserRouteAccessService],
  },
];

export default notificationRoute;
