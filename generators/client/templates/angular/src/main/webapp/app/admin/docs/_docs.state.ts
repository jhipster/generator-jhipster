import { Routes } from '@angular/router';

import { RouteCanActivate } from '../../shared';
import { <%=jhiPrefixCapitalized%>DocsComponent } from './docs.component';

export const docsRoute: Routes = [
  {
    path: 'docs',
    component: <%=jhiPrefixCapitalized%>DocsComponent,
    canActivate: [DocsResolve],
    data: { 
      authorities: ['ROLE_ADMIN'] 
    },
    canActivate: [RouteCanActivate]
  }
];
