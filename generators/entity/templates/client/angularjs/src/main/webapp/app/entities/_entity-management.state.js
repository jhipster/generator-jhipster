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
        .state('<%= entityStateName %>', {
            parent: 'entity',
            url: '/<%= entityUrl %><% if (pagination === 'pagination' || pagination === 'pager') { %>?page&sort&search<% } %>',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityPluralFileName %>.html',
                    controller: '<%= entityAngularName %>Controller',
                    controllerAs: 'vm'
                }
            },
            <%_ if (pagination === 'pagination' || pagination === 'pager'){ _%>
            params: {
                page: {
                    value: '1',
                    squash: true
                },
                sort: {
                    value: 'id,asc',
                    squash: true
                },
                search: null
            },
            <%_ } _%>
            resolve: {
            <%_ if (pagination === 'pagination' || pagination === 'pager'){ _%>
                pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                    return {
                        page: PaginationUtil.parsePage($stateParams.page),
                        sort: $stateParams.sort,
                        predicate: PaginationUtil.parsePredicate($stateParams.sort),
                        ascending: PaginationUtil.parseAscending($stateParams.sort),
                        search: $stateParams.search
                    };
                }]<%= (pagination === 'pagination' || pagination === 'pager' && enableTranslation) ? ',' : '' %>
            <%_ } if (enableTranslation){ _%>
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('<%= entityInstance %>');<%
                    for (const idx in fields) {
                      if (fields[idx].fieldIsEnum === true) { %>
                    $translatePartialLoader.addPart('<%= fields[idx].enumInstance %>');<% }} %>
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            <%_ } _%>
            }
        })
        .state('<%= entityStateName %>-detail', {
            parent: '<%= entityStateName %>',
            url: '/<%= entityUrl %>/{id}',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.detail.title'<% }else{ %>'<%= entityClass %>'<% } %>
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityFileName %>-detail.html',
                    controller: '<%= entityAngularName %>DetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {<% if (enableTranslation){ %>
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('<%= entityInstance %>');<%
                    for (const idx in fields) {
                      if (fields[idx].fieldIsEnum === true) { %>
                    $translatePartialLoader.addPart('<%= fields[idx].enumInstance %>');<% }} %>
                    return $translate.refresh();
                }],<% } %>
                entity: ['$stateParams', '<%= entityClass %>', function($stateParams, <%= entityClass %>) {
                    return <%= entityClass %>.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || '<%= entityStateName %>',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('<%= entityStateName %>-detail.edit', {
            parent: '<%= entityStateName %>-detail',
            url: '/detail/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityFileName %>-dialog.html',
                    controller: '<%= entityAngularName %>DialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['<%= entityClass %>', function(<%= entityClass %>) {
                            return <%= entityClass %>.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('^', {}, { reload: false });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('<%= entityStateName %>.new', {
            parent: '<%= entityStateName %>',
            url: '/new',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityFileName %>-dialog.html',
                    controller: '<%= entityAngularName %>DialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                <%_ for (idx in fields) { _%>
                                    <%_ if (fields[idx].fieldType === 'Boolean' && fields[idx].fieldValidate === true && fields[idx].fieldValidateRules.indexOf('required') !== -1) { _%>
                                <%= fields[idx].fieldName %>: false,
                                    <%_ } else { _%>
                                <%= fields[idx].fieldName %>: null,
                                        <%_ if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { _%>
                                <%= fields[idx].fieldName %>ContentType: null,
                                        <%_ } _%>
                                    <%_ } _%>
                                <%_ } _%>
                                id: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('<%= entityStateName %>', null, { reload: '<%= entityStateName %>' });
                }, function() {
                    $state.go('<%= entityStateName %>');
                });
            }]
        })
        .state('<%= entityStateName %>.edit', {
            parent: '<%= entityStateName %>',
            url: '/{id}/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityFileName %>-dialog.html',
                    controller: '<%= entityAngularName %>DialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['<%= entityClass %>', function(<%= entityClass %>) {
                            return <%= entityClass %>.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('<%= entityStateName %>', null, { reload: '<%= entityStateName %>' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('<%= entityStateName %>.delete', {
            parent: '<%= entityStateName %>',
            url: '/{id}/delete',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityFileName %>-delete-dialog.html',
                    controller: '<%= entityAngularName %>DeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['<%= entityClass %>', function(<%= entityClass %>) {
                            return <%= entityClass %>.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('<%= entityStateName %>', null, { reload: '<%= entityStateName %>' });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();
