SettingsStateConfig.$inject = ['$stateProvider'];

export function SettingsStateConfig($stateProvider) {
    $stateProvider.state('settings', {
        parent: 'account',
        url: '/settings',
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'global.menu.account.settings'
        },
        views: {
            'content@': {
                template: '<settings></settings>'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('settings');
                return $translate.refresh();
            }]
        }
    });
}
