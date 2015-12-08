'use strict';

angular.module('<%=angularAppName%>')
    .controller('SettingsController', function ($scope, Principal, Auth<% if (enableTranslation){ %>, Language, $translate<% } %>) {
        $scope.success = null;
        $scope.error = null;
        Principal.identity(true).then(function(account) {
            $scope.settingsAccount = copyAccount(account);
        });

        $scope.save = function () {
            Auth.updateAccount($scope.settingsAccount).then(function() {
                $scope.error = null;
                $scope.success = 'OK';
                Principal.identity(true).then(function(account) {
                    $scope.settingsAccount = copyAccount(account);
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
        
        /**
         * a separate variable for storing account data instead of using the same global
         * @param account
         */
        var copyAccount = function (account) {
            return {
                activated: account.activated,
                authorities: account.authorities.slice(0),
                email: account.email,
                firstName: account.firstName,
                langKey: account.langKey,
                lastName: account.lastName,
                login: account.login,
                password: null
            }
        }
    });
