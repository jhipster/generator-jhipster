import { Route } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { <%=jhiPrefixCapitalized%>DocsComponent } from './docs.component';

export const docsRoute: Route = {
  path: 'docs',
  component: <%=jhiPrefixCapitalized%>DocsComponent,
  data: {
    authorities: ['ROLE_ADMIN'],
    pageTitle: 'global.menu.admin.apidocs'
  },
  canActivate: [UserRouteAccessService]
};
