import { AdminStateConfig } from 'admin.state';
import { AuditStateConfig } from 'audits/audits.state';
import { ConfigStateConfig } from 'configuration/configuration.state';
import { GatewayStateConfig } from 'gateway/gateway.state';
import { DocsStateConfig } from 'docs/docs.state';
import { HealthStateConfig } from 'health/health.state';
import { LogsStateConfig } from 'logs/logs.state';
import { MetricsStateConfig } from 'metrics/metrics.state';
import { TrackerStateConfig } from 'tracker/tracker.state';
import { UserMgmntStateConfig } from 'user-management/user-management.state';

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
    .config(GatewayStateConfig)
    .config(DocsStateConfig)
    .config(HealthStateConfig)
    .config(LogsStateConfig)
    .config(MetricsStateConfig)
    .config(TrackerStateConfig)
    .config(UserMgmntStateConfig);
