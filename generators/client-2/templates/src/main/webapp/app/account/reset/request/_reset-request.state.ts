PasswordResetInitStateConfig.$inject = ['$stateProvider'];

export function PasswordResetInitStateConfig($stateProvider) {
    $stateProvider.state('requestReset', {
        parent: 'account',
        url: '/reset/request',
        data: {
            authorities: []
        },
        views: {
            'content@': {
                template: '<password-reset-init></password-reset-init>'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('reset');
                return $translate.refresh();
            }]
        }
    });
}
