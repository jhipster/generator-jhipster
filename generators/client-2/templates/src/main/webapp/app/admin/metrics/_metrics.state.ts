MetricsStateConfig.$inject = ['$stateProvider'];

export function MetricsStateConfig($stateProvider) {
    $stateProvider.state('<%=jhiPrefix%>-metrics', {
        parent: 'admin',
        url: '/metrics',
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'metrics.title'
        },
        views: {
            'content@': {
                templateUrl: 'app/admin/metrics/metrics.html',
                controller: '<%=jhiPrefixCapitalized%>MetricsMonitoringController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('metrics');
                return $translate.refresh();
            }]
        }
    });
}
