ConfigStateConfig.$inject = ['$stateProvider'];

export function ConfigStateConfig($stateProvider) {
    $stateProvider.state('<%=jhiPrefix%>-configuration', {
        parent: 'admin',
        url: '/configuration',
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'configuration.title'
        },
        views: {
            'content@': {
                template: '<jhi-configuration></jhi-configuration>'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('configuration');
                return $translate.refresh();
            }]
        }
    });
}
