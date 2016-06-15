
AppStateConfig.$inject = ['$stateProvider'];

export function AppStateConfig($stateProvider) {
    $stateProvider.state('app', {
        abstract: true,
        views: {
            'navbar@': {
                templateUrl: 'app/layouts/navbar/navbar.html',
                controller: 'NavbarController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            authorize: ['Auth',
                function (Auth) {
                    return Auth.authorize();
                }
            ]<% if (enableTranslation) { %>,
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('global');
            }]<% } %>
        }
    });
}
