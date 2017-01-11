<<<<<<< HEAD
import { Ng2StateDeclaration } from 'ui-router-ng2';
=======
import { Injectable } from '@angular/core';
import { Routes, CanActivate } from '@angular/router';

>>>>>>> Changed from state to route - admin
import { <%=jhiPrefixCapitalized%>DocsComponent } from './docs.component';
import { Principal } from '../../shared';


@Injectable()
export class DocsResolve implements CanActivate {

  constructor(private principal: Principal) {}

  canActivate() {
      return this.principal.identity().then(account => this.principal.hasAnyAuthority(['ROLE_ADMIN']));
  }

}

export const docsRoute: Routes = [
  {
    path: 'docs',
    component: <%=jhiPrefixCapitalized%>DocsComponent,
    canActivate: [DocsResolve]
  }
];
