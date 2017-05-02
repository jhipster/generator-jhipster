<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
<%_ if (websocket === 'spring-websocket') { _%>
import { <%=jhiPrefixCapitalized%>TrackerService } from './../shared/tracker/tracker.service';
<%_ } _%>

import { <%=angular2AppName%>SharedModule } from '../shared';
/* jhipster-needle-add-admin-module-import - JHipster will add admin modules imports here */

import {
    adminState,
    <%_ if (devDatabaseType !== 'cassandra') { _%>
    AuditsComponent,
    <%_ } _%>
    <%_ if (!skipUserManagement) { _%>
    UserMgmtComponent,
    UserDialogComponent,
    UserDeleteDialogComponent,
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
    <%_ if (devDatabaseType !== 'cassandra') { _%>
    AuditsService,
    <%_ } _%>
    <%=jhiPrefixCapitalized%>ConfigurationService,
    <%=jhiPrefixCapitalized%>HealthService,
    <%=jhiPrefixCapitalized%>MetricsService,
    <%_ if (applicationType === 'gateway') { _%>
    GatewayRoutesService,
    <%=jhiPrefixCapitalized%>GatewayComponent,
    <%_ } _%>
    <%_ if (websocket === 'spring-websocket') { _%>
    <%=jhiPrefixCapitalized%>TrackerComponent,
    <%_ } _%>
    LogsService,
    <%_ if (!skipUserManagement) { _%>
    UserResolvePagingParams,
    UserResolve,
    UserModalService
    <%_ } _%>
} from './';

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule,
        RouterModule.forRoot(adminState, { useHash: true }),
        /* jhipster-needle-add-admin-module - JHipster will add admin modules here */
    ],
    declarations: [
        <%_ if (devDatabaseType !== 'cassandra') { _%>
        AuditsComponent,
        <%_ } _%>
        <%_ if (!skipUserManagement) { _%>
        UserMgmtComponent,
        UserDialogComponent,
        UserDeleteDialogComponent,
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
        <%_ if (devDatabaseType !== 'cassandra') { _%>
        AuditsService,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>ConfigurationService,
        <%=jhiPrefixCapitalized%>HealthService,
        <%=jhiPrefixCapitalized%>MetricsService,
        <%_ if (applicationType === 'gateway') { _%>
        GatewayRoutesService,
        <%_ } _%>
        LogsService,
        <%_ if (websocket === 'spring-websocket') { _%>
        <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
        <%_ if (!skipUserManagement) { _%>
        UserResolvePagingParams,
        UserResolve,
        UserModalService
        <%_ } _%>
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%=angular2AppName%>AdminModule {}
