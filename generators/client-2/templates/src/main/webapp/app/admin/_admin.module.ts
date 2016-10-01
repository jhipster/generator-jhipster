import * as angular from 'angular';

import { upgradeAdapter } from '../upgrade_adapter';

<%_ if (websocket === 'spring-websocket') { _%>
import { TrackerStateConfig } from './tracker/tracker.state';
<%_ } _%>
import { UserMgmntStateConfig } from './user-management/user-management.state';

import { AuditsComponent } from './audits/audits.component';
import { LogsComponent } from './logs/logs.component';

import { <%=jhiPrefixCapitalized%>MetricsMonitoringModalComponent } from './metrics/metrics-modal.component';
import { <%=jhiPrefixCapitalized%>MetricsMonitoringComponent } from './metrics/metrics.component';
import { <%=jhiPrefixCapitalized%>HealthModalComponent } from './health/health-modal.component';
import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health/health.component';
import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration/configuration.component';
<%_ if (applicationType === 'gateway') { _%>
import { <%=jhiPrefixCapitalized%>GatewayComponent } from './gateway/gateway.component';
<%_ } _%>

<%_ if (applicationType === 'gateway') { _%>
import { GatewayRoutesService } from './gateway/gateway-routes.service';
<%_ } _%>

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
