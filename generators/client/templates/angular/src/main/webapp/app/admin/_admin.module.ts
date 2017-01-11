import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ParseLinks } from 'ng-jhipster';

import { <%=angular2AppName%>SharedModule } from '../shared';

import {
    AuditsComponent,
    <%_ if (!skipUserManagement) { _%>
    UserMgmtComponent,
    UserMgmtDetailComponent,
    UserMgmtDialogComponent,
    UserMgmtDeleteDialogComponent,
    <%_ } _%>
    LogsComponent,
    <%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent,
    <%=jhiPrefixCapitalized%>MetricsMonitoringComponent,
    <%=jhiPrefixCapitalized%>HealthModalComponent,
    <%=jhiPrefixCapitalized%>HealthCheckComponent,
    <%=jhiPrefixCapitalized%>ConfigurationComponent,
    <%=jhiPrefixCapitalized%>DocsComponent,
    AuditsService,
    UserService,
    <%=jhiPrefixCapitalized%>ConfigurationService,
    <%=jhiPrefixCapitalized%>HealthService,
    <%=jhiPrefixCapitalized%>MetricsService,
    <%_ if (applicationType === 'gateway') { _%>
    GatewayRoutesService,
    <%=jhiPrefixCapitalized%>GatewayComponent,
    gatewayState,
    <%_ } _%>
    <%_ if (websocket === 'spring-websocket') { _%>
    <%=jhiPrefixCapitalized%>TrackerComponent,
    trackerState,
    TrackerResolve,
    <%_ } _%>
    LogsService,
    adminRoute,
    auditRoute,
    configRoute,
    docsRoute,
    healthRoute,
    logsRoute,
    <%_ if (!skipUserManagement) { _%>
    userMgmtRoute,
    userMgmtDetailRoute,
    UserResolvePagingParams,
    UserResolve,
    <%_ } _%>
    metricsRoute,
    AuditsResolve,
    ConfigurationResolve,
    DocsResolve,
    HealthResolve,
    LogsResolve,
    MetricsResolve
} from './';

let ADMIN_STATES = [
    ...adminRoute,
    ...auditRoute,
    ...configRoute,
    ...docsRoute,
    ...healthRoute,
    ...logsRoute,
    <%_ if (applicationType === 'gateway') { _%>
    ...gatewayRoute,
    <%_ } _%>
    <%_ if (websocket === 'spring-websocket') { _%>
    ...trackerRoute,
    <%_ } _%>
    <%_ if (!skipUserManagement) { _%>
    ...userMgmtRoute,
    ...userMgmtDetailRoute,
    <%_ } _%>
    ...metricsRoute
];

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule,
        RouterModule.forRoot(ADMIN_STATES, { useHash: true })
    ],
    declarations: [
        AuditsComponent,
        <%_ if (!skipUserManagement) { _%>
        UserMgmtComponent,
        UserMgmtDetailComponent,
        UserMgmtDialogComponent,
        UserMgmtDeleteDialogComponent,
        <%_ } _%>
        LogsComponent,
        <%=jhiPrefixCapitalized%>ConfigurationComponent,
        <%=jhiPrefixCapitalized%>HealthCheckComponent,
        <%=jhiPrefixCapitalized%>HealthModalComponent,
        <%=jhiPrefixCapitalized%>DocsComponent,
        <%_ if (applicationType === 'gateway') { _%>
        <%=jhiPrefixCapitalized%>GatewayComponent,
        <%_ } _%>
        <%_ if (websocket === 'spring-websocket') { _%>
        <%=jhiPrefixCapitalized%>TrackerComponent,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>MetricsMonitoringComponent,
        <%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent
    ],
    entryComponents: [
        <%_ if (!skipUserManagement) { _%>
        UserMgmtDialogComponent,
        UserMgmtDeleteDialogComponent,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>HealthModalComponent,
        <%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent,
    ],
    providers: [
        AuditsService,
        UserService,
        <%=jhiPrefixCapitalized%>ConfigurationService,
        <%=jhiPrefixCapitalized%>HealthService,
        <%=jhiPrefixCapitalized%>MetricsService,
        <%_ if (applicationType === 'gateway') { _%>
        GatewayRoutesService,
        <%_ } _%>
        LogsService,
        <%_ if (websocket === 'spring-websocket') { _%>
        TrackerResolve,
        <%_ } _%>        
        <%_ if (!skipUserManagement) { _%>
        UserResolvePagingParams,
        UserResolve,
        <%_ } _%>
        AuditsResolve,
        ConfigurationResolve,
        DocsResolve,
        HealthResolve,
        LogsResolve,
        MetricsResolve
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%=angular2AppName%>AdminModule {}
