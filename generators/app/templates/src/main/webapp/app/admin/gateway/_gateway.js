'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('gateway', {
                parent: 'admin',
                url: '/gateway',
                data: {
                    authorities: ['ROLE_ADMIN'],
                    pageTitle: 'gateway.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/gateway/gateway.html',
                        controller: 'GatewayController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('gateway');
                        return $translate.refresh();
                    }]
                }
            });
    });
