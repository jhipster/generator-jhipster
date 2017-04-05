import { Route } from '@angular/router';

import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration.component';

export const configurationRoute: Route = {
  path: '<%=jhiPrefix%>-configuration',
  component: <%=jhiPrefixCapitalized%>ConfigurationComponent,
  data: {
    pageTitle: 'configuration.title'
  }
};
