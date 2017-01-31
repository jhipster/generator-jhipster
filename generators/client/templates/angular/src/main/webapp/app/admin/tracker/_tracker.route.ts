import { Route } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>TrackerComponent } from './tracker.component';
import { <%=jhiPrefixCapitalized%>TrackerService, Principal } from '../../shared';

export const trackerRoute: Route = {
  path: '<%=jhiPrefix%>-tracker',
  component: <%=jhiPrefixCapitalized%>TrackerComponent,
  data: {
    pageTitle: 'tracker.title'
  }
};
