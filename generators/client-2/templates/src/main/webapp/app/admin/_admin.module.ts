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

import { AuditsService } from './audits/audits.service';

import { upgradeAdapter } from '../upgrade_adapter';

upgradeAdapter.addProvider(AuditsService);

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
    .factory('AuditsService', upgradeAdapter.downgradeNg2Provider(AuditsService));
