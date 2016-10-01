import { <%=jhiPrefixCapitalized%>MetricsMonitoringComponent } from './metrics.component';

export const metricsState = {
    name: '<%=jhiPrefix%>-metrics',
    parent: 'admin',
    url: '/metrics',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'metrics.title'
    },
    views: {
        'content@': { component: <%=jhiPrefixCapitalized%>MetricsMonitoringComponent }
    },
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('metrics');
            return $translate.refresh();
        }]
    }
}
