'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('<%= entityInstance %>', {
                parent: 'entity',
                url: '/<%= entityInstance %>s',
                data: {
                    authorities: ['ROLE_USER'],
                    pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityInstance %>.home.title'<% }else{ %>'<%= entityClass %>s'<% } %>
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/<%= entityInstance %>/<%= entityInstance %>s.html',
                        controller: '<%= entityClass %>Controller'
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
            .state('<%= entityInstance %>.detail', {
                parent: 'entity',
                url: '/<%= entityInstance %>/{id}',
                data: {
                    authorities: ['ROLE_USER'],
                    pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityInstance %>.detail.title'<% }else{ %>'<%= entityClass %>'<% } %>
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/<%= entityInstance %>/<%= entityInstance %>-detail.html',
                        controller: '<%= entityClass %>DetailController'
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
            .state('<%= entityInstance %>.new', {
                parent: '<%= entityInstance %>',
                url: '/new',
                data: {
                    authorities: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'scripts/app/entities/<%= entityInstance %>/<%= entityInstance %>-dialog.html',
                        controller: '<%= entityClass %>DialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {
                                    <%_ for (fieldId in fields) { _%>
                                    	<%_ if (fields[fieldId].fieldType == 'Boolean' && fields[fieldId].fieldValidate == true && fields[fieldId].fieldValidateRules.indexOf('required') != -1) { _%>
                                    <%= fields[fieldId].fieldName %>: false,
                                    	<%_ } else { _%>
                                    <%= fields[fieldId].fieldName %>: null,
                                        	<%_ if (fields[fieldId].fieldType == 'byte[]') { _%>
                                    <%= fields[fieldId].fieldName %>ContentType: null,
                                        	<%_ } _%>
                                        <%_ } _%>
                                    <%_ } _%>
                                    id: null
                                };
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('<%= entityInstance %>', null, { reload: true });
                    }, function() {
                        $state.go('<%= entityInstance %>');
                    })
                }]
            })
            .state('<%= entityInstance %>.edit', {
                parent: '<%= entityInstance %>',
                url: '/{id}/edit',
                data: {
                    authorities: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'scripts/app/entities/<%= entityInstance %>/<%= entityInstance %>-dialog.html',
                        controller: '<%= entityClass %>DialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['<%= entityClass %>', function(<%= entityClass %>) {
                                return <%= entityClass %>.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('<%= entityInstance %>', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
            .state('<%= entityInstance %>.delete', {
                parent: '<%= entityInstance %>',
                url: '/{id}/delete',
                data: {
                    authorities: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'scripts/app/entities/<%= entityInstance %>/<%= entityInstance %>-delete-dialog.html',
                        controller: '<%= entityClass %>DeleteController',
                        size: 'md',
                        resolve: {
                            entity: ['<%= entityClass %>', function(<%= entityClass %>) {
                                return <%= entityClass %>.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('<%= entityInstance %>', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
