'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/health', {
                templateUrl: 'scripts/client/app/admin/health/health.html',
                controller: 'HealthController',
                authenticate: true,
                roles: 'ROLE_ADMIN'
            })
    })
    .controller('HealthController', function ($scope, MonitoringService) {
        $scope.updatingHealth = true;

        $scope.refresh = function () {
            $scope.updatingHealth = true;
            MonitoringService.checkHealth().then(function (reponse) {
                $scope.healthCheck = reponse;
                $scope.updatingHealth = false;
            }, function (reponse) {
                $scope.healthCheck = reponse.data;
                $scope.updatingHealth = false;
            });
        };

        $scope.refresh();

        $scope.getLabelClass = function (statusState) {
            if (statusState == 'UP') {
                return "label-success";
            } else {
                return "label-danger";
            }
        }
    });
