import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration.component';
import { Principal } from '../../shared';

export const configurationRoute: Routes = [
  {
    path: '<%=jhiPrefix%>-configuration',
    component: <%=jhiPrefixCapitalized%>ConfigurationComponent,
    resolve: {
      'translate': <%=jhiPrefixCapitalized%>ConfigurationResolve
    }
  }
];
