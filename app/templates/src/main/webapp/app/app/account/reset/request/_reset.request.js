'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('requestReset', {
                parent: 'account',
                url: '/reset/request',
                data: {
                    authorities: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/reset/request/reset.request.html',
                        controller: 'RequestResetController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('reset');
                        return $translate.refresh();
                    }]
                }
            });
    });
