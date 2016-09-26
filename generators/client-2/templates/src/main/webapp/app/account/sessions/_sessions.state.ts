SessionsStateConfig.$inject = ['$stateProvider'];

export function SessionsStateConfig($stateProvider) {
    $stateProvider.state('sessions', {
        parent: 'account',
        url: '/sessions',
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'global.menu.account.sessions'
        },
        views: {
            'content@': {
                template: '<sessions></sessions>'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('sessions');
                return $translate.refresh();
            }]
        }
    });
}
