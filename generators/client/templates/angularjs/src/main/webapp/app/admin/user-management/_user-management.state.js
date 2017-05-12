<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('user-management', {
            parent: 'admin',
            url: '/user-management<%_ if (databaseType !== 'cassandra') { _%>?page&sort<%_ } _%>',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'userManagement.home.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/user-management/user-management.html',
                    controller: 'UserManagementController',
                    controllerAs: 'vm'
                }
            },<%_ if (databaseType !== 'cassandra') { _%>
            params: {
                page: {
                    value: '1',
                    squash: true
                },
                sort: {
                    value: 'id,asc',
                    squash: true
                }
            },
            resolve: {
                pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                    return {
                        page: PaginationUtil.parsePage($stateParams.page),
                        sort: $stateParams.sort,
                        predicate: PaginationUtil.parsePredicate($stateParams.sort),
                        ascending: PaginationUtil.parseAscending($stateParams.sort)
                    };
                }]<%_ if (enableTranslation){ _%>,
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('user-management');
                    return $translate.refresh();
                }]
            <%_ } _%>

            }<%_ } else { _%>

            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('user-management');
                    return $translate.refresh();
                }]
            }
            <%_ } _%>
        })
        .state('user-management.new', {
            url: '/new',
            data: {
                authorities: ['ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/admin/user-management/user-management-dialog.html',
                    controller: 'UserManagementDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                id: null, login: null, firstName: null, lastName: null, email: null,
                                activated: true, langKey: null, createdBy: null, createdDate: null,
                                lastModifiedBy: null, lastModifiedDate: null, resetDate: null,
                                resetKey: null, authorities: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('user-management', null, { reload: true });
                }, function() {
                    $state.go('user-management');
                });
            }]
        })
        .state('user-management.edit', {
            url: '/{login}/edit',
            data: {
                authorities: ['ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/admin/user-management/user-management-dialog.html',
                    controller: 'UserManagementDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['User', function(User) {
                            return User.get({login : $stateParams.login});
                        }]
                    }
                }).result.then(function() {
                    $state.go('user-management', null, { reload: true });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('user-management-detail', {
            parent: 'user-management',
            url: '/{login}',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'user-management.detail.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/user-management/user-management-detail.html',
                    controller: 'UserManagementDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('user-management');
                    return $translate.refresh();
                }]
            }
        })
        .state('user-management.delete', {
            url: '/{login}/delete',
            data: {
                authorities: ['ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/admin/user-management/user-management-delete-dialog.html',
                    controller: 'UserManagementDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['User', function(User) {
                            return User.get({login : $stateParams.login});
                        }]
                    }
                }).result.then(function() {
                    $state.go('user-management', null, { reload: true });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }
})();
