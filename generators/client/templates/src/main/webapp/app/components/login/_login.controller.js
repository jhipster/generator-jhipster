(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$rootScope', '$state', '$sessionStorage', '$timeout', 'Auth', '$uibModalInstance'];

    function LoginController ($rootScope, $state, $sessionStorage, $timeout, Auth, $uibModalInstance) {
        var vm = this;

        vm.authenticationError = false;
        vm.cancel = cancel;
        vm.credentials = {};
        vm.login = login;
        vm.password = null;
        vm.register = register;
        vm.rememberMe = true;
        vm.requestResetPassword = requestResetPassword;
        vm.username = null;

        $timeout(function (){angular.element('#username').focus();});

        function cancel () {
            vm.credentials = {
                username: null,
                password: null,
                rememberMe: true
            };
            vm.authenticationError = false;
            $uibModalInstance.dismiss('cancel');
        }

        function login (event) {
            event.preventDefault();
            Auth.login({
                username: vm.username,
                password: vm.password,
                rememberMe: vm.rememberMe
            }).then(function () {
                vm.authenticationError = false;
                $uibModalInstance.close();
                if ($state.current.name === 'register' || $state.current.name === 'activate' ||
                    $state.current.name === 'finishReset' || $state.current.name === 'requestReset') {
                    $state.go('home');
                }

                // If we're redirected to login, our
                // previousState is already set in the authExpiredInterceptor. When login succesful go to stored state
                if ($sessionStorage.previousStateName) {
                    $state.go($sessionStorage.previousStateName, $sessionStorage.previousStateParams);
                } else {
                    $rootScope.$broadcast('authenticationSuccess');
                }
            }).catch(function () {
                vm.authenticationError = true;
            });
        }

        function register () {
            $uibModalInstance.dismiss('cancel');
            $state.go('register');
        }

        function requestResetPassword () {
            $uibModalInstance.dismiss('cancel');
            $state.go('requestReset');
        }
    }
})();
