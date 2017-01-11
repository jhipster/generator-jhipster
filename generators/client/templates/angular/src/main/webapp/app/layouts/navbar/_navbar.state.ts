import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';

import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../shared';

// @Injectable()
// export class AuthorizeResolve implements Resolve<any> {
//
//   constructor(private authService: AuthService) {}
//
//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
//       return this.authService.authorize();
//   }
//
// }

export const navbarRoute: Routes = [
  {
    path: '',
    component: NavbarComponent,
    // TODO : Make this work
    // resolve: {
    //  'authorize': AuthorizeResolve
    // },
    outlet: 'navbar'
  }
];
