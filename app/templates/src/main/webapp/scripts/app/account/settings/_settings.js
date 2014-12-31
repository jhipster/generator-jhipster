'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('settings', {
                parent: 'account',
                url: '/settings',
                data: {
                    roles: ['ROLE_USER']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/settings/settings.html',
                        controller: 'SettingsController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('settings');
                        return $translate.refresh();
                    }]
                }
            });
    });
