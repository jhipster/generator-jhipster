'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('userManagment', {
                parent: 'admin',
                url: '/user-managment',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'userManagment.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/userManagment/usersManagment.html',
                        controller: 'UserManagmentController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('userManagment');
                        return $translate.refresh();
                    }]
                }
            })
            .state('userManagmentDetail', {
                parent: 'admin',
                url: '/user-managment/:id',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'userManagment.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/userManagment/userManagment-detail.html',
                        controller: 'UserManagmentDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('userManagment');
                        return $translate.refresh();
                    }]
                }
            });
    });
