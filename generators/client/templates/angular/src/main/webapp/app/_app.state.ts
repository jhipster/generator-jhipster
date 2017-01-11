import { JhiLanguageService } from 'ng-jhipster';
import { NavbarComponent } from './layouts';
import { AuthService } from './shared';

import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Routes } from '@angular/router';

import { NavbarComponent } from './layouts';
import { AuthService } from './shared';

@Injectable()
export class AuthorizeResolve implements Resolve<any> {

  constructor(private authService: AuthService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.authorize();
  }

  canActivate() {
    return true;
  }
}


export const navbarRoute: Routes = [
  {
    path: '',
    component: NavbarComponent,
    resolve: {
      'authorize': AuthorizeResolve
    },
    outlet: 'navbar'
  }
];
