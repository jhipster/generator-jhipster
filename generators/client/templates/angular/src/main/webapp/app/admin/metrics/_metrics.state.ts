import { Injectable } from '@angular/core';
import { Routes, CanActivate } from '@angular/router';

import { <%=jhiPrefixCapitalized%>MetricsMonitoringComponent } from './metrics.component';
import { Principal } from '../../shared';


@Injectable()
export class MetricsResolve implements CanActivate {

  constructor(private principal: Principal) {}

  canActivate() {
  	return this.principal.identity().then(account => this.principal.hasAnyAuthority(['ROLE_ADMIN']));
  }

}
export const metricsRoute: Routes = [
  {
    path: 'jhi-metrics',
    component: <%=jhiPrefixCapitalized%>MetricsMonitoringComponent,
    canActivate: [MetricsResolve]
  }
];
