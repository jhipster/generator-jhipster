'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('<%= entityInstance %>', {
                parent: 'entity',
                url: '/<%= entityInstance %>s',
                data: {
                    roles: ['ROLE_USER'],
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
                        $translatePartialLoader.addPart('<%= entityInstance %>');
                        $translatePartialLoader.addPart('global');
                        return $translate.refresh();
                    }]<% } %>
                }
            })
            .state('<%= entityInstance %>.detail', {
                parent: 'entity',
                url: '/<%= entityInstance %>/{id}',
                data: {
                    roles: ['ROLE_USER'],
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
                        $translatePartialLoader.addPart('<%= entityInstance %>');
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
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/<%= entityInstance %>/<%= entityInstance %>-dialog.html',
                        controller: '<%= entityClass %>DialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {<% for (fieldId in fields) { %><%= fields[fieldId].fieldName %>: null, <% } %>id: null};
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
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
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
            });
    });
