'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('error', {
                parent: 'site',
                url: '/error',
                data: {
                    authorities: [],
                    pageTitle: 'error.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/error/error.html'
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
                parent: 'site',
                url: '/accessdenied',
                data: {
                    authorities: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/error/accessdenied.html'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                        $translatePartialLoader.addPart('error');
                        return $translate.refresh();
                    }]
                }
            });
    });
