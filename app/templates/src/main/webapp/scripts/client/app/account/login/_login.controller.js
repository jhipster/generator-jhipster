'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: 'scripts/client/app/account/login/login.html',
                controller: 'LoginController'
            })
    })
    .controller('LoginController', function ($scope, $location, Auth) {
        $scope.user = {};
        $scope.errors = {};

        $scope.rememberMe = true;
        $scope.login = function () {
            Auth.login({
                username: $scope.username,
                password: $scope.password,
                rememberMe: $scope.rememberMe
            }).then(function () {
                $scope.authenticationError = false;
                // Logged in, redirect to home
                $location.path('/');

            }).catch(function (err) {
                $scope.authenticationError = true;
            });
        }
    });
