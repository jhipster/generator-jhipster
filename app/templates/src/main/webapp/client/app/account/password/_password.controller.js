'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/password', {
                templateUrl: 'views/password.html',
                controller: 'PasswordController',
                authenticate: true
            })
    })
    .controller('PasswordController', function ($scope, Auth) {
        $scope.success = null;
        $scope.error = null;
        $scope.doNotMatch = null;
        $scope.changePassword = function () {
            if ($scope.password != $scope.confirmPassword) {
                $scope.doNotMatch = "ERROR";
            } else {
                $scope.doNotMatch = null;
                Auth.changePassword($scope.password).then(function () {
                    $scope.error = null;
                    $scope.success = 'OK';
                }).catch(function () {
                    $scope.success = null;
                    $scope.error = "ERROR";
                });
            }
        };
    });
