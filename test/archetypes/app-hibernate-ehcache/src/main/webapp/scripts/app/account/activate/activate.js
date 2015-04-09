'use strict';

angular.module('jhipsterApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('activate', {
                parent: 'account',
                url: '/activate?key',
                data: {
                    roles: [],
                    pageTitle: 'activate.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/activate/activate.html',
                        controller: 'ActivationController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('activate');
                        return $translate.refresh();
                    }]
                }
            });
    });

