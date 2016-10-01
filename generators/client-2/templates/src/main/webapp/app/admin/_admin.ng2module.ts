import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UIRouterModule } from 'ui-router-ng2';

import { <%=angular2AppName%>SharedModule } from '../shared/shared.ng2module';

import { AuditsService } from './audits/audits.service';
import { <%=jhiPrefixCapitalized%>ConfigurationService } from './configuration/configuration.service';
import { <%=jhiPrefixCapitalized%>HealthService } from './health/health.service';
import { <%=jhiPrefixCapitalized%>MetricsService } from './metrics/metrics.service';
<%_ if (applicationType === 'gateway') { _%>
import { GatewayRoutesService } from './gateway/gateway-routes.service';
<%_ } _%>
import { LogsService } from './logs/logs.service';
import { ParseLinks } from '../shared/service/parse-links.service';

import { AuditsComponent } from './audits/audits.component';
import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration/configuration.component';
import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health/health.component';
import { <%=jhiPrefixCapitalized%>HealthModalComponent } from './health/health-modal.component';
<%_ if (applicationType === 'gateway') { _%>
import { <%=jhiPrefixCapitalized%>GatewayComponent } from './gateway/gateway.component';
<%_ } _%>
import { <%=jhiPrefixCapitalized%>DocsComponent } from './docs/docs.component';
import { LogsComponent } from './logs/logs.component';
import { <%=jhiPrefixCapitalized%>MetricsMonitoringComponent } from './metrics/metrics.component';
import { <%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent } from './metrics/metrics-modal.component';

import { adminState } from './admin.state';
import { auditState } from './audits/audits.state';
import { configState } from './configuration/configuration.state';
import { docsState } from './docs/docs.state';
import { healthState } from './health/health.state';
import { logsState } from './logs/logs.state';
import { metricsState } from './metrics/metrics.state';
<%_ if (applicationType === 'gateway') { _%>
import { gatewayState } from './gateway/gateway.state';
<%_ } _%>

let ADMIN_STATES = [
    adminState,
    auditState,
    configState,
    docsState,
    healthState,
    logsState,
    <%_ if (applicationType === 'gateway') { _%>
    gatewayState,
    <%_ } _%>
    metricsState
];

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule,
        UIRouterModule.forChild({ states: ADMIN_STATES })
    ],
    declarations: [
        AuditsComponent,
        LogsComponent
        <%=jhiPrefixCapitalized%>ConfigurationComponent,
        <%=jhiPrefixCapitalized%>HealthCheckComponent,
        <%=jhiPrefixCapitalized%>HealthModalComponent,
        <%=jhiPrefixCapitalized%>DocsComponent,
        <%_ if (applicationType === 'gateway') { _%>
        <%=jhiPrefixCapitalized%>GatewayComponent,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>MetricsMonitoringComponent,
        <%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent
    ],
    providers: [
        AuditsService,
        <%=jhiPrefixCapitalized%>ConfigurationService,
        <%=jhiPrefixCapitalized%>HealthService,
        <%=jhiPrefixCapitalized%>MetricsService,
        <%_ if (applicationType === 'gateway') { _%>
        GatewayRoutesService,
        <%_ } _%>
        LogsService,
        ParseLinks
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%=angular2AppName%>AdminModule {}
