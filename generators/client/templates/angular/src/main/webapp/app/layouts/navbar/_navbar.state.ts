<<<<<<< HEAD
import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { NavbarComponent } from './layouts';
import { AuthService } from './shared';

export const appState: Ng2StateDeclaration = {
    name: 'app',
    abstract: true,
    views: {
        'navbar@': { component: NavbarComponent }
    },
    resolve: [
        {
            token: 'authorize',
            deps: [AuthService],
            resolveFn: (auth) => auth.authorize()
        }<% if (enableTranslation) { %>,
        {
            token: 'translate',
            deps: [JhiLanguageService],
            resolveFn: (languageService: JhiLanguageService) => languageService.setLocations([])
        }<% } %>
    ]
};
=======
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';

import { NavbarComponent } from './layouts';
import { AuthService } from './shared';

@Injectable()
export class AuthorizeResolve implements Resolve<any> {

  constructor(private authService: AuthService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.authorize();
  }
  
}


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
>>>>>>> Changed from state to route - layouts
