'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('logs', {
                parent: 'admin',
                url: '/logs',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: <% if (enableTranslation){ %>'logs.title'<% }else{ %>'Logs'<% } %>
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/logs/logs.html',
                        controller: 'LogsController'
                    }
                }<% if (enableTranslation){ %>,
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('logs');
                        return $translate.refresh();
                    }]
                }<% } %>
            });
    });
