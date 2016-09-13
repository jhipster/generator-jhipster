PasswordResetFinishStateConfig.$inject = ['$stateProvider'];

export function PasswordResetFinishStateConfig($stateProvider) {
    $stateProvider.state('finishReset', {
        parent: 'account',
        url: '/reset/finish?key',
        data: {
           authorities: []
        },
        views: {
            'content@': {
                 template: '<password-reset-finish></password-reset-finish>'
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
