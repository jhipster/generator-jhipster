'use strict';

angular.module('jhipsterApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('myEntity', {
                parent: 'entity',
                url: '/myEntity',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'jhipsterApp.myEntity.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/myEntity/myEntitys.html',
                        controller: 'MyEntityController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('myEntity');
                        return $translate.refresh();
                    }]
                }
            })
            .state('myEntityDetail', {
                parent: 'entity',
                url: '/myEntity/:id',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'jhipsterApp.myEntity.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/myEntity/myEntity-detail.html',
                        controller: 'MyEntityDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('myEntity');
                        return $translate.refresh();
                    }]
                }
            });
    });
