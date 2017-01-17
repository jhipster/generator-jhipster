import { Route } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>TrackerComponent } from './tracker.component';
import { <%=jhiPrefixCapitalized%>TrackerService, Principal } from '../../shared';

export const trackerRoute: Route = {
  path: 'jhi-tracker',
  component: <%=jhiPrefixCapitalized%>TrackerComponent,
  data: {
    pageTitle: 'tracker.title'
  }
};

// onEnter: (trans: Transition) => {
//     trans.injector().get(<%=jhiPrefixCapitalized%>TrackerService).subscribe();
// },
// onExit: (trans: Transition) => {
//     trans.injector().get(<%=jhiPrefixCapitalized%>TrackerService).unsubscribe();
// }
