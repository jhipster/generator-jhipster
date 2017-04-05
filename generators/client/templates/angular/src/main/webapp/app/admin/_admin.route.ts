import { Routes } from '@angular/router';

import {
    <%_ if (devDatabaseType !== 'cassandra') { _%>
    auditsRoute,
    <%_ } _%>
    configurationRoute,
    docsRoute,
    healthRoute,
    logsRoute,
    metricsRoute,
    <%_ if (applicationType === 'gateway') { _%>
    gatewayRoute,
    <%_ } _%>
    <%_ if (websocket === 'spring-websocket') { _%>
    trackerRoute,
    <%_ } _%>
    <%_ if (!skipUserManagement) { _%>
    userMgmtRoute,
    userDialogRoute
    <%_ } _%>
} from './';

import { UserRouteAccessService } from '../shared';

let ADMIN_ROUTES = [
    <%_ if (devDatabaseType !== 'cassandra') { _%>
    auditsRoute,
    <%_ } _%>
    configurationRoute,
    docsRoute,
    healthRoute,
    logsRoute,
    <%_ if (applicationType === 'gateway') { _%>
    gatewayRoute,
    <%_ } _%>
    <%_ if (websocket === 'spring-websocket') { _%>
    trackerRoute,
    <%_ } _%>
    <%_ if (!skipUserManagement) { _%>
    ...userMgmtRoute,
    <%_ } _%>
    metricsRoute
];


export const adminState: Routes = [{
    path: '',
    data: {
        authorities: ['ROLE_ADMIN']
    },
    canActivate: [UserRouteAccessService],
    children: ADMIN_ROUTES
},
    <%_ if (!skipUserManagement) { _%>
    ...userDialogRoute
    <%_ } _%>
];
