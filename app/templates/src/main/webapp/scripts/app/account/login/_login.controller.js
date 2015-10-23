(function () {
    'use strict';

    angular.module('<%=angularAppName%>.account.login')
        .controller('LoginController', controller);

    controller.inject = ['$rootScope', '$state', '$timeout', 'Auth'];
    /* @ngInject */
    function controller($rootScope, $state, $timeout, Auth){

        var vm = this;
        vm.user = {};
        vm.errors = {};
        vm.rememberMe = true;

        activate();
        function activate() {

        }


        $timeout(function (){angular.element('[ng-model="username"]').focus();});
        vm.login = function (event) {
            event.preventDefault();
            Auth.login({
                username: vm.username,
                password: vm.password,
                rememberMe: vm.rememberMe
            }).then(function () {
                vm.authenticationError = false;
                if ($rootScope.previousStateName === 'register') {
                    $state.go('home');
                } else {
                    $rootScope.back();
                }
            }).catch(function () {
                vm.authenticationError = true;
            });
        };
    }
})();
