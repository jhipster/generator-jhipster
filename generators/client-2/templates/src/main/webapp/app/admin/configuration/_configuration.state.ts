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
                templateUrl: 'app/admin/configuration/configuration.html',
                controller: '<%=jhiPrefixCapitalized%>ConfigurationController',
                controllerAs: 'vm'
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
