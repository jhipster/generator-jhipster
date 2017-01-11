import { Injectable } from '@angular/core';
import { Routes } from '@angular/router';

import { <%=jhiPrefixCapitalized%>TrackerComponent } from './tracker.component';
import { <%=jhiPrefixCapitalized%>TrackerService, Principal } from '../../shared';


@Injectable()
export class TrackerResolve implements CanActivate {

  constructor(private principal: Principal) {}

  canActivate() {
  	return this.principal.identity().then(account => this.principal.hasAnyAuthority(['ROLE_ADMIN']));
  }

}


export const trackerRoute: Routes = [
  {
    path: 'jhi-tracker',
    component: <%=jhiPrefixCapitalized%>TrackerComponent,
    canActivate: [TrackerResolve]
  }
];

// onEnter: (trans: Transition) => {
//     trans.injector().get(<%=jhiPrefixCapitalized%>TrackerService).subscribe();
// },
// onExit: (trans: Transition) => {
//     trans.injector().get(<%=jhiPrefixCapitalized%>TrackerService).unsubscribe();
// }
