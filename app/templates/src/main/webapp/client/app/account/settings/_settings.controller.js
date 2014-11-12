'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/settings', {
                templateUrl: 'client/app/account/settings/settings.html',
                controller: 'SettingsController',
                authenticate: true,
                roles: 'ROLE_USER'
            })
    })
    .controller('SettingsController', function ($scope, Account, Auth) {
        $scope.success = null;
        $scope.error = null;
        Account.get(function(response) {
            $scope.settingsAccount = response.data;
        });

        $scope.save = function () {
            Auth.updateAccount($scope.settingsAccount).then(function() {
                $scope.error = null;
                $scope.success = 'OK';
                Account.get(function(response) {
                    $scope.settingsAccount = response.data;
                });
            }).catch(function() {
                $scope.success = null;
                $scope.error = "ERROR";
            });
        };
    });
