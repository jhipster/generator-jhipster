'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('userManagement', {
                parent: 'admin',
                url: '/user-management',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'userManagement.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/userManagement/usersManagement.html',
                        controller: 'UserManagementController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('userManagement');
                        return $translate.refresh();
                    }]
                }
            })
            .state('userManagementDetail', {
                parent: 'admin',
                url: '/user-management/:id',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'userManagement.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/userManagement/userManagement-detail.html',
                        controller: 'UserManagementDetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('userManagement');
                        return $translate.refresh();
                    }]
                }
            });
    });
