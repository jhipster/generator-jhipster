import * as angular from 'angular';

import { upgradeAdapter } from '../upgrade_adapter';


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
    <%_ if (applicationType === 'gateway') { _%>
    <%=jhiPrefixCapitalized%>GatewayComponent,
    GatewayRoutesService,
    <%_ } _%>
    <%=jhiPrefixCapitalized%>ConfigurationComponent,
    UserService
} from './';

angular
    .module('<%=angularAppName%>.admin', [
        <%_ if (enableTranslation) { _%>
        'tmh.dynamicLocale',
        <%_ } _%>
        'ngResource',
        'ui.bootstrap',
        'ui.router'
    ])
    <%_ if (!skipUserManagement) { _%>
    .directive('userMgmt', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(UserMgmtComponent))
    .directive('userMgmtDetail', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(UserMgmtDetailComponent))
    .directive('userMgmtDialog', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(UserMgmtDialogComponent))
    .directive('userMgmtDeleteDialog', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(UserMgmtDeleteDialogComponent))
    <%_ } _%>
    .directive('<%=jhiPrefix%>Metrics', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>MetricsMonitoringComponent))
    .directive('<%=jhiPrefix%>MetricsModal', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent))
    .directive('<%=jhiPrefix%>Health', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>HealthCheckComponent))
    .directive('<%=jhiPrefix%>HealthModal', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>HealthModalComponent))
    .directive('<%=jhiPrefix%>Audit', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(AuditsComponent))
    .directive('<%=jhiPrefix%>Configuration', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>ConfigurationComponent))
    .directive('<%=jhiPrefix%>Logs', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(LogsComponent))
    <%_ if (applicationType === 'gateway') { _%>
    .directive('<%=jhiPrefix%>Gateway', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>GatewayComponent))
    <%_ } _%>
    .factory('UserService', upgradeAdapter.downgradeNg2Provider(UserService));
