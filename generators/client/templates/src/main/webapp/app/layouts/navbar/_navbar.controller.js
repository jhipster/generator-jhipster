(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('NavbarController', function ($scope, $location, $state, Auth, Principal, ENV, LoginService) {
            $scope.isAuthenticated = Principal.isAuthenticated;
            $scope.$state = $state;
            $scope.inProduction = ENV === 'prod';

            $scope.logout = function () {
                Auth.logout();
                $state.go('home');
            };

            $scope.login = function () {
                LoginService.open();
            };
        });
})();
