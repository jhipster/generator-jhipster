'use strict';

angular.module('<%=angularAppName%>')
    .controller('HomeController', function ($scope, Principal, $state, LoginService) {
        Principal.identity().then(function(account) {
            $scope.account = account;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });

        $scope.login = LoginService.open;

        $scope.register = function () {
            $state.go('register');
        };
    });
