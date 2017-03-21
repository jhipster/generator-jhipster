import { Route } from '@angular/router';

import { <%=jhiPrefixCapitalized%>DocsComponent } from './docs.component';

export const docsRoute: Route = {
  path: 'docs',
  component: <%=jhiPrefixCapitalized%>DocsComponent,
  data: {
    pageTitle: 'global.menu.admin.apidocs'
  }
};
