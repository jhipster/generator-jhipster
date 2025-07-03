import { Routes } from '@angular/router';

export const errorRoute: Routes = [
  {
    path: 'error',
    loadComponent: () => import('./error.component'),
    title: 'error.title',
  },
  {
    path: 'accessdenied',
    loadComponent: () => import('./error.component'),
    data: {
      errorMessage: 'error.http.403',
    },
    title: 'error.title',
  },
  {
    path: '404',
    loadComponent: () => import('./error.component'),
    data: {
      errorMessage: 'error.http.404',
    },
    title: 'error.title',
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
