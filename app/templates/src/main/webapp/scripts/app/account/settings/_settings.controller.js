'use strict';

angular.module('<%=angularAppName%>')
    .controller('SettingsController', function ($scope, Principal, Auth) {
        $scope.success = null;
        $scope.error = null;
        Principal.identity().then(function(account) {
            $scope.settingsAccount = account;
        });

        $scope.save = function () {
            Auth.updateAccount($scope.settingsAccount).then(function() {
                $scope.error = null;
                $scope.success = 'OK';
                Principal.identity().then(function(account) {
                    $scope.settingsAccount = account;
                });
                $rootScope.$broadcast('updateUsername');
            }).catch(function() {
                $scope.success = null;
                $scope.error = 'ERROR';
            });
        };
    });
