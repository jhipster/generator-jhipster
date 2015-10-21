(function() {
    'use strict';

    var module = angular.module('<%=angularAppName%>');


    module.config(configure);

    /* @ngInject */
    configure.$inject = ['$stateProvider'];


    function configure($stateProvider) {
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
                        templateUrl: 'scripts/app/<%= entityInstance %>/views/<%= entityInstance %>s.html',
                        controller: '<%= entityClass %>Controller',
                        controllerAs: 'vm',
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
                        templateUrl: 'scripts/app/<%= entityInstance %>/views/<%= entityInstance %>-detail.html',
                        controller: '<%= entityClass %>DetailController',
                        controllerAs: 'vm',
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
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/<%= entityInstance %>/views/<%= entityInstance %>-dialog.html',
                        controller: '<%= entityClass %>DialogController',
                        controllerAs: 'vm',
                        size: 'lg',
                    }
                },
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
            })
            .state('<%= entityInstance %>.edit', {
                parent: 'entity',
                url: '/<%= entityInstance %>/{id}/edit',
                data: {
                    authorities: ['ROLE_USER'],
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/<%= entityInstance %>/views/<%= entityInstance %>-dialog.html',
                        controller: '<%= entityClass %>DialogController',
                        controllerAs: 'vm',
                        size: 'lg',
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

            });
    }

})();
