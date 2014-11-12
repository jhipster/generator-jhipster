'use strict';

angular.module('<%=angularAppName%>')
    .controller('NavbarController', function ($scope, $location, Auth, Role) {
        $scope.isLoggedIn = Auth.isLoggedIn;
        $scope.account = Auth.getCurrentAccount;
        $scope.hasRole = Role.hasRole;
        $scope.ROLES = Role.allRoles();

        $scope.logout = function () {
            Auth.logout();
            $location.path('/');
        };
    });
