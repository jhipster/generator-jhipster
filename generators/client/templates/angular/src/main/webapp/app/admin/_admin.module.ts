import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UIRouterModule } from 'ui-router-ng2';

import { <%=angular2AppName%>SharedModule, ParseLinks } from '../shared';

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
    <%_ } _%>
    LogsService,
    adminState,
    auditState,
    configState,
    docsState,
    healthState,
    logsState,
    <%_ if (!skipUserManagement) { _%>
    userMgmtState,
    userMgmtDetailState,
    userMgmtNewState,
    userMgmtEditState,
    userMgmtDeleteState,
    <%_ } _%>
    metricsState
} from './';

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
    <%_ if (websocket === 'spring-websocket') { _%>
    trackerState,
    <%_ } _%>
    <%_ if (!skipUserManagement) { _%>
    userMgmtState,
    userMgmtDetailState,
    userMgmtNewState,
    userMgmtEditState,
    userMgmtDeleteState,
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
        ParseLinks
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%=angular2AppName%>AdminModule {}
