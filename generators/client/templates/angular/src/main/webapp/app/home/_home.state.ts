import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../shared';
import { HomeComponent } from './';

export const homeRoute: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [UserRouteAccessService]
  }
];
