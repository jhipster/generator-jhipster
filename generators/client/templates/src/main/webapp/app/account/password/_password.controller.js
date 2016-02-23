(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('PasswordController', PasswordController);

    PasswordController.$inject = ['Auth', 'Principal'];

    function PasswordController (Auth, Principal) {
        var vm = this;

        Principal.identity().then(function(account) {
            vm.account = account;
        });

        vm.success = null;
        vm.error = null;
        vm.doNotMatch = null;
        vm.changePassword = function () {
            if (vm.password !== vm.confirmPassword) {
                vm.error = null;
                vm.success = null;
                vm.doNotMatch = 'ERROR';
            } else {
                vm.doNotMatch = null;
                Auth.changePassword(vm.password).then(function () {
                    vm.error = null;
                    vm.success = 'OK';
                }).catch(function () {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
            }
        };
    }
})();
