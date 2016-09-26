import * as angular from 'angular';

import { upgradeAdapter } from '../upgrade_adapter';

import { AdminStateConfig } from './admin.state';
import { AuditStateConfig } from './audits/audits.state';
import { ConfigStateConfig } from './configuration/configuration.state';
import { DocsStateConfig } from './docs/docs.state';
<%_ if (applicationType === 'gateway') { _%>
import { GatewayStateConfig } from './gateway/gateway.state';
<%_ } _%>
import { HealthStateConfig } from './health/health.state';
import { LogsStateConfig } from './logs/logs.state';
import { MetricsStateConfig } from './metrics/metrics.state';
<%_ if (websocket === 'spring-websocket') { _%>
import { TrackerStateConfig } from './tracker/tracker.state';
<%_ } _%>
import { UserMgmntStateConfig } from './user-management/user-management.state';

import { AuditsComponent } from "./audits/audits.component";
import { LogsComponent } from './logs/logs.component';

import { <%=jhiPrefixCapitalized%>MetricsMonitoringModalController } from "./metrics/metrics-modal.controller";
import { <%=jhiPrefixCapitalized%>MetricsMonitoringController } from "./metrics/metrics.controller";
import { <%=jhiPrefixCapitalized%>HealthModalComponent } from "./health/health-modal.component";
import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health/health.component';
import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration/configuration.component';
<%_ if (applicationType === 'gateway') { _%>
import { <%=jhiPrefixCapitalized%>GatewayComponent } from './gateway/gateway.component';
<%_ } _%>

import { <%=jhiPrefixCapitalized%>HealthService } from './health/health.service';
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
    .config(AdminStateConfig)
    .config(AuditStateConfig)
    .config(ConfigStateConfig)
    .config(DocsStateConfig)
    <%_ if (applicationType === 'gateway') { _%>
    .config(GatewayStateConfig)
    <%_ } _%>
    .config(HealthStateConfig)
    .config(LogsStateConfig)
    .config(MetricsStateConfig)
    <%_ if (websocket === 'spring-websocket') { _%>
    .config(TrackerStateConfig)
    <%_ } _%>
    .config(UserMgmntStateConfig)
    .controller('<%=jhiPrefixCapitalized%>MetricsMonitoringController', <%=jhiPrefixCapitalized%>MetricsMonitoringController)
    .controller('<%=jhiPrefixCapitalized%>MetricsMonitoringModalController', <%=jhiPrefixCapitalized%>MetricsMonitoringModalController)
    .directive('<%=jhiPrefix%>HealthModal', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>HealthModalComponent))
    .directive('<%=jhiPrefix%>Audit', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(AuditsComponent))
    .directive('<%=jhiPrefix%>Configuration', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>ConfigurationComponent))
    .directive('<%=jhiPrefix%>Health', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>HealthCheckComponent))
    .directive('<%=jhiPrefix%>Logs', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(LogsComponent))
    <%_ if (applicationType === 'gateway') { _%>
    .directive('<%=jhiPrefix%>Gateway', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>GatewayComponent))
    .factory('GatewayRoutesService', upgradeAdapter.downgradeNg2Provider(GatewayRoutesService))
    <%_ } _%>
    .factory('<%=jhiPrefixCapitalized%>HealthService', upgradeAdapter.downgradeNg2Provider(<%=jhiPrefixCapitalized%>HealthService));
