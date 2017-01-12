import { Routes } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import { HomeComponent } from './';

export const homeRoute: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [RouteCanActivate]
  }, {
    path:'**',
    component: HomeComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [RouteCanActivate]
  }
];
