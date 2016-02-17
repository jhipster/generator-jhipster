'use strict';

angular.module('<%=angularAppName%>')
    .controller('HomeController', function ($scope, Principal, LoginService) {
        function getAccount() {
            Principal.identity().then(function(account) {
                $scope.account = account;
                $scope.isAuthenticated = Principal.isAuthenticated;
            });
        }
        getAccount();

        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });
    });
