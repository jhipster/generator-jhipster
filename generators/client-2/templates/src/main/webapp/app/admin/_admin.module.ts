import * as angular from 'angular';

import { upgradeAdapter } from '../upgrade_adapter';

<%_ if (websocket === 'spring-websocket') { _%>
import { TrackerStateConfig } from './tracker/tracker.state';
<%_ } _%>
import { UserMgmntStateConfig } from './user-management/user-management.state';

import {
    AuditsComponent,
    LogsComponent,
    <%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent,
    <%=jhiPrefixCapitalized%>MetricsMonitoringComponent,
    <%=jhiPrefixCapitalized%>HealthModalComponent,
    <%=jhiPrefixCapitalized%>HealthCheckComponent,
    <%_ if (applicationType === 'gateway') { _%>
    <%=jhiPrefixCapitalized%>GatewayComponent,
    GatewayRoutesService,
    <%_ } _%>
    <%=jhiPrefixCapitalized%>ConfigurationComponent
} from './';

upgradeAdapter.upgradeNg1Provider('$uibModal');

angular
    .module('<%=angularAppName%>.admin', [
        'ngStorage',
        <%_ if (enableTranslation) { _%>
        'tmh.dynamicLocale',
        'pascalprecht.translate',
        <%_ } _%>
        'ngResource',
        'ui.bootstrap',
        'ui.router'
    ])
    <%_ if (websocket === 'spring-websocket') { _%>
    .config(TrackerStateConfig)
    <%_ } _%>
    .config(UserMgmntStateConfig)
    .directive('<%=jhiPrefix%>Metrics', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>MetricsMonitoringComponent))
    .directive('<%=jhiPrefix%>MetricsModal', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent))
    .directive('<%=jhiPrefix%>Health', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>HealthCheckComponent))
    .directive('<%=jhiPrefix%>HealthModal', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>HealthModalComponent))
    .directive('<%=jhiPrefix%>Audit', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(AuditsComponent))
    .directive('<%=jhiPrefix%>Configuration', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>ConfigurationComponent))
    .directive('<%=jhiPrefix%>Logs', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(LogsComponent))
    <%_ if (applicationType === 'gateway') { _%>
    .directive('<%=jhiPrefix%>Gateway', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>GatewayComponent))
    .factory('GatewayRoutesService', upgradeAdapter.downgradeNg2Provider(GatewayRoutesService))
    <%_ } _%>
    ;
