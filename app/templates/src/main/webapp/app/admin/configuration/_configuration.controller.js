'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/configuration', {
                templateUrl: 'app/admin/configuration/configuration.html',
                controller: 'ConfigurationController',
                authenticate: true,
                roles: 'ROLE_ADMIN'
            })
    })
    .controller('ConfigurationController', function ($scope, ConfigurationService) {
        $scope.configuration = ConfigurationService.get();
    });
