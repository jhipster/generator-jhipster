ActivateStateConfig.$inject = ['$stateProvider'];

export function ActivateStateConfig($stateProvider) {
    $stateProvider.state('activate', {
        parent: 'account',
        url: '/activate?key',
        data: {
            authorities: [],
            pageTitle: 'activate.title'
        },
        views: {
            'content@': {
                template: '<activate></activate>'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('activate');
                return $translate.refresh();
            }]
        }
    });
}
