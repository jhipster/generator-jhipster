'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('<%= entityInstance %>-management', {
                parent: 'entity',
                url: '/<%= entityInstance %>-management',
                data: {
                    authorities: ['ROLE_USER'],
                    pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityInstance %>-management.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
                },
                views: {
                    'content@': {
                        templateUrl: 'app/entities/<%= entityInstance %>-management/<%= entityInstance %>-management.html',
                        controller: '<%= entityClass %>ManagementController'
                    }
                },
                resolve: {<% if (enableTranslation){ %>
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('<%= entityInstance %>');<%
                        for (var fieldIdx in fields) {
                          if (fields[fieldIdx].fieldIsEnum == true) { %>
                        $translatePartialLoader.addPart('<%= fields[fieldIdx].enumInstance %>');<% }} %>
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]<% } %>
                }
            })
            .state('<%= entityInstance %>-management-detail', {
                parent: 'entity',
                url: '/<%= entityInstance %>-management/{id:<% if (databaseType == 'sql') { %>int<% } else if (databaseType == 'mongodb') { %>[0-9a-fA-F]{24}<% } else if (databaseType == 'cassandra') { %>[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}<% } %>}',
                data: {
                    authorities: ['ROLE_USER'],
                    pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityInstance %>-management.detail.title'<% }else{ %>'<%= entityClass %>'<% } %>
                },
                views: {
                    'content@': {
                        templateUrl: 'app/entities/<%= entityInstance %>-management/<%= entityInstance %>-management-detail.html',
                        controller: '<%= entityClass %>ManagementDetailController'
                    }
                },
                resolve: {<% if (enableTranslation){ %>
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('<%= entityInstance %>');<%
                        for (var fieldIdx in fields) {
                          if (fields[fieldIdx].fieldIsEnum == true) { %>
                        $translatePartialLoader.addPart('<%= fields[fieldIdx].enumInstance %>');<% }} %>
                        return $translate.refresh();
                    }],<% } %>
                    entity: ['$stateParams', '<%= entityClass %>', function($stateParams, <%= entityClass %>) {
                        return <%= entityClass %>.get({id : $stateParams.id});
                    }]
                }
            })
            .state('<%= entityInstance %>-management.new', {
                parent: '<%= entityInstance %>-management',
                url: '/new',
                data: {
                    authorities: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'app/entities/<%= entityInstance %>-management/<%= entityInstance %>-management-dialog.html',
                        controller: '<%= entityClass %>ManagementDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {
                                    <%_ for (fieldId in fields) { _%>
                                    	<%_ if (fields[fieldId].fieldType == 'Boolean' && fields[fieldId].fieldValidate == true && fields[fieldId].fieldValidateRules.indexOf('required') != -1) { _%>
                                    <%= fields[fieldId].fieldName %>: false,
                                    	<%_ } else { _%>
                                    <%= fields[fieldId].fieldName %>: null,
                                        	<%_ if (fields[fieldId].fieldType == 'byte[]' && fields[fieldId].fieldTypeBlobContent != 'text') { _%>
                                    <%= fields[fieldId].fieldName %>ContentType: null,
                                        	<%_ } _%>
                                        <%_ } _%>
                                    <%_ } _%>
                                    id: null
                                };
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('<%= entityInstance %>-management', null, { reload: true });
                    }, function() {
                        $state.go('<%= entityInstance %>-management');
                    })
                }]
            })
            .state('<%= entityInstance %>-management.edit', {
                parent: '<%= entityInstance %>-management',
                url: '/{id:<% if (databaseType == 'sql') { %>int<% } else if (databaseType == 'mongodb') { %>[0-9a-fA-F]{24}<% } else if (databaseType == 'cassandra') { %>[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}<% } %>}/edit',
                data: {
                    authorities: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'app/entities/<%= entityInstance %>-management/<%= entityInstance %>-management-dialog.html',
                        controller: '<%= entityClass %>ManagementDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['<%= entityClass %>', function(<%= entityClass %>) {
                                return <%= entityClass %>.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('<%= entityInstance %>-management', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
            .state('<%= entityInstance %>-management.delete', {
                parent: '<%= entityInstance %>-management',
                url: '/{id:<% if (databaseType == 'sql') { %>int<% } else if (databaseType == 'mongodb') { %>[0-9a-fA-F]{24}<% } else if (databaseType == 'cassandra') { %>[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}<% } %>}/delete',
                data: {
                    authorities: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'app/entities/<%= entityInstance %>-management/<%= entityInstance %>-management-delete-dialog.html',
                        controller: '<%= entityClass %>ManagementDeleteController',
                        size: 'md',
                        resolve: {
                            entity: ['<%= entityClass %>', function(<%= entityClass %>) {
                                return <%= entityClass %>.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('<%= entityInstance %>-management', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
