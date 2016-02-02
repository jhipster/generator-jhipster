'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('docs', {
                parent: 'admin',
                url: '/docs',
                data: {
                    authorities: ['ROLE_ADMIN'],
                    pageTitle: 'global.menu.admin.apidocs'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/docs/docs.html'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', function ($translate) {
                        return $translate.refresh();
                    }]
                }
            });
    });
