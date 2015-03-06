'use strict';

angular.module('<%=angularAppName%>')
    .controller('LoginController', function ($rootScope, $scope, $state, $timeout, Auth) {
        $scope.user = {};
        $scope.errors = {};

        $scope.rememberMe = true;
        $timeout(function (){angular.element('[ng-model="username"]').focus();});
        $scope.login = function () {
            Auth.login({
                username: $scope.username,
                password: $scope.password,
                rememberMe: $scope.rememberMe
            }).then(function () {
                $scope.authenticationError = false;
                if ($rootScope.previousStateName === 'register') {
                    $state.go('home');
                } else {
                    $rootScope.back();
                }
            }).catch(function () {
                $scope.authenticationError = true;
            });
        };
    })
    .directive('noDirtyCheck', function() {
        // Interacting with input elements having this directive won't cause the
        // form to be marked dirty. http://stackoverflow.com/questions/17089090/prevent-input-from-setting-form-dirty-angularjs
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$pristine = false;
            }
        }
    });
