ErrorStateConfig.$inject = ['$stateProvider'];

export function ErrorStateConfig($stateProvider) {
    $stateProvider
        .state('error', {
            parent: 'app',
            url: '/error',
            data: {
                authorities: [],
                pageTitle: 'error.title'
            },
            views: {
                'content@': {
                    template: '<error></error>'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('error');
                    return $translate.refresh();
                }]
            }
        })
        .state('accessdenied', {
            parent: 'app',
            url: '/accessdenied',
            data: {
                authorities: []
            },
            views: {
                'content@': {
                    template: '<error></error>'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('error');
                    return $translate.refresh();
                }]
            }
        });
}
