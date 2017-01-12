import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>TrackerComponent } from './tracker.component';
import { <%=jhiPrefixCapitalized%>TrackerService, Principal } from '../../shared';

export const trackerRoute: Routes = [
  {
    path: 'jhi-tracker',
    component: <%=jhiPrefixCapitalized%>TrackerComponent,
    data: {
      authorities: ['ROLE_ADMIN'],
      pageTitle: 'tracker.title'
    },
    canActivate: [UserRouteAccessService]
  }
];

// onEnter: (trans: Transition) => {
//     trans.injector().get(<%=jhiPrefixCapitalized%>TrackerService).subscribe();
// },
// onExit: (trans: Transition) => {
//     trans.injector().get(<%=jhiPrefixCapitalized%>TrackerService).unsubscribe();
// }
