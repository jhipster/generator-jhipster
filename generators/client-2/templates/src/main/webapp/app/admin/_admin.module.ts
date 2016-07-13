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

import { <%=jhiPrefixCapitalized%>HealthCheckController } from './health/health.controller';
import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration/configuration.component';

import { AuditsService } from './audits/audits.service';
import { <%=jhiPrefixCapitalized%>HealthService } from './health/health.service';
import { LogsService } from './logs/logs.service';
import { ParseLinks } from "../components/util/parse-links.service";

import { upgradeAdapter } from '../upgrade_adapter';

upgradeAdapter.addProvider(AuditsService);
upgradeAdapter.addProvider(<%=jhiPrefixCapitalized%>HealthService);
upgradeAdapter.addProvider(LogsService);
upgradeAdapter.addProvider(ParseLinks);

angular
    .module('<%=angularAppName%>.admin', [
        'ngStorage', <% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate', <% } %>
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
    .controller('<%=jhiPrefixCapitalized%>HealthCheckController', <%=jhiPrefixCapitalized%>HealthCheckController)
    .directive('<%=jhiPrefix%>Audit', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(AuditsComponent))
    .directive('<%=jhiPrefix%>Configuration', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>ConfigurationComponent))
    .directive('<%=jhiPrefix%>Logs', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(LogsComponent))
    .factory('<%=jhiPrefixCapitalized%>HealthService', upgradeAdapter.downgradeNg2Provider(<%=jhiPrefixCapitalized%>HealthService));
