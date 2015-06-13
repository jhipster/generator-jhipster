'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('userManagement', {
                parent: 'admin',
                url: '/user-managment',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'userManagement.home.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/userManagement/usersManagement.html',
                        controller: 'userManagementController'
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
                url: '/user-managment/:login',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'userManagement.detail.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/userManagement/userManagement-detail.html',
                        controller: 'userManagementDetailController'
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
