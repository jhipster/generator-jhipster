'use strict';

angular.module('<%=angularAppName%>')
    .controller('LoginController', function ($rootScope, $scope, $state, $timeout, Auth, $uibModalInstance) {
        $scope.authenticationError = false;

        $scope.rememberMe = true;
        $timeout(function (){angular.element('[ng-model="username"]').focus();});
        $scope.login = function (event) {
            event.preventDefault();
            Auth.login({
                username: $scope.username,
                password: $scope.password,
                rememberMe: $scope.rememberMe
            }).then(function () {
                $scope.authenticationError = false;
                $uibModalInstance.close();
                // If we're redirected to login, our
                // previousState is already set in the authExpiredInterceptor. When login succesful go to stored state
                if ($rootScope.redirected && $rootScope.previousStateName) {
                    $state.go($rootScope.previousStateName, $rootScope.previousStateParams);
                    $rootScope.redirected = false;
                }
            }).catch(function () {
                $scope.authenticationError = true;
            });
        };

        $scope.cancel = function () {
            $scope.credentials = {
                username: null,
                password: null,
                rememberMe: true
            };
            $scope.authenticationError = false;
            $uibModalInstance.dismiss('cancel');
        };

        $scope.requestResetPassword = function () {
            $uibModalInstance.dismiss('cancel');
            $state.go('requestReset');
        };

        $scope.register = function () {
            $uibModalInstance.dismiss('cancel');
            $state.go('register');
        };
    });
