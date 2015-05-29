'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('<%= entityInstance %>', {
                parent: 'entity',
                url: '/<%= entityInstance %>',
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
                        return $translate.refresh();
                    }]<% } %>
                }
            })
            .state('<%= entityInstance %>Detail', {
                parent: 'entity',
                url: '/<%= entityInstance %>/:id',
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
                    }]<% } %>
                }
            });
    });
