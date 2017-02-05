import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Route } from '@angular/router';

import { NavbarComponent } from './layouts';
/* import { AuthService } from './shared';

@Injectable()
export class AuthorizeResolve implements Resolve<any> {

  constructor(private authService: AuthService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.authorize();
  }
} */

export const navbarRoute: Route = {
    path: '',
    component: NavbarComponent,
    // resolve: {
    //   'authorize': AuthorizeResolve
    // },
    outlet: 'navbar'
  };
