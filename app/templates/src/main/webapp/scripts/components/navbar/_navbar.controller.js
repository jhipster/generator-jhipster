'use strict';

angular.module('<%=angularAppName%>')
    .controller('NavbarController', function ($scope, $location, $state, Auth, Principal) {
        $scope.$state = $state;

        $scope.refresh = function() {
            Principal.identity().then(function(account) {
                $scope.account = account;
                $scope.isAuthenticated = Principal.isAuthenticated;
                $scope.isInRole = Principal.isInRole;
            });
        };
        $scope.refresh();
        
        $scope.$on('updateUsername', function() {
            $scope.refresh();
        });
        
        $scope.logout = function () {
            Auth.logout();
            $state.go('home');
        };
    });
