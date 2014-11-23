'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('configuration', {
                parent: 'admin',
                url: '/configuration',
                data: {
                    roles: ['ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'app/admin/configuration/configuration.html',
                        controller: 'ConfigurationController'
                    }
                }
            });
    })
    .controller('ConfigurationController', function ($scope, ConfigurationService) {
        $scope.configuration = ConfigurationService.get();
    });
