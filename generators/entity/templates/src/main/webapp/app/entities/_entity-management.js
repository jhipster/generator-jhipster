'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('<%= entityStateName %>', {
                parent: 'entity',
                url: '/<%= entityUrl %>',
                data: {
                    authorities: ['ROLE_USER'],
                    pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
                },
                views: {
                    'content@': {
                        templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityFileName %>.html',
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
            .state('<%= entityStateName %>-detail', {
                parent: 'entity',
                url: '/<%= entityUrl %>/{id:<%= entityUrlType %>}',
                data: {
                    authorities: ['ROLE_USER'],
                    pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.detail.title'<% }else{ %>'<%= entityClass %>'<% } %>
                },
                views: {
                    'content@': {
                        templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityFileName %>-detail.html',
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
            .state('<%= entityStateName %>.new', {
                parent: '<%= entityStateName %>',
                url: '/new',
                data: {
                    authorities: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityFileName %>-dialog.html',
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
                        $state.go('<%= entityStateName %>', null, { reload: true });
                    }, function() {
                        $state.go('<%= entityStateName %>');
                    })
                }]
            })
            .state('<%= entityStateName %>.edit', {
                parent: '<%= entityStateName %>',
                url: '/{id:<%= entityUrlType %>}/edit',
                data: {
                    authorities: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityFileName %>-dialog.html',
                        controller: '<%= entityClass %>ManagementDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['<%= entityClass %>', function(<%= entityClass %>) {
                                return <%= entityClass %>.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('<%= entityStateName %>', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
            .state('<%= entityStateName %>.delete', {
                parent: '<%= entityStateName %>',
                url: '/{id:<%= entityUrlType %>}/delete',
                data: {
                    authorities: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'app/entities/<%= entityFolderName %>/<%= entityFileName %>-delete-dialog.html',
                        controller: '<%= entityClass %>ManagementDeleteController',
                        size: 'md',
                        resolve: {
                            entity: ['<%= entityClass %>', function(<%= entityClass %>) {
                                return <%= entityClass %>.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('<%= entityStateName %>', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
