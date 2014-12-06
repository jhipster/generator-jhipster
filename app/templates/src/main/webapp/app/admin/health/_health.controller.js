'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('health', {
                parent: 'admin',
                url: '/health',
                data: {
                    roles: ['ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'app/admin/health/health.html',
                        controller: 'HealthController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('app/admin/health');
                        return $translate.refresh();
                    }]
                }
            });
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
