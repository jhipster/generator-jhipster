HealthStateConfig.$inject = ['$stateProvider'];

export function HealthStateConfig($stateProvider) {
    $stateProvider.state('<%=jhiPrefix%>-health', {
        parent: 'admin',
        url: '/health',
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'health.title'
        },
        views: {
            'content@': {
                template: '<<%=jhiPrefix%>-health></<%=jhiPrefix%>-health>'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('health');
                return $translate.refresh();
            }]
        }
    });
}
