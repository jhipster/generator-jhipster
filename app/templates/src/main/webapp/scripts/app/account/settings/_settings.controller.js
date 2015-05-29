'use strict';

angular.module('<%=angularAppName%>')
    .controller('SettingsController', function ($scope, Principal, Auth<% if (enableTranslation){ %>, Language, $translate<% } %>) {
        $scope.success = null;
        $scope.error = null;
        Principal.identity(true).then(function(account) {
            $scope.settingsAccount = account;
        });

        $scope.save = function () {
            Auth.updateAccount($scope.settingsAccount).then(function() {
                $scope.error = null;
                $scope.success = 'OK';
                Principal.identity().then(function(account) {
                    $scope.settingsAccount = account;
                });<% if (enableTranslation){ %>
                Language.getCurrent().then(function(current) {
                    if ($scope.settingsAccount.langKey !== current) {
                        $translate.use($scope.settingsAccount.langKey);
                    }
                });<% } %>
            }).catch(function() {
                $scope.success = null;
                $scope.error = 'ERROR';
            });
        };
    });
