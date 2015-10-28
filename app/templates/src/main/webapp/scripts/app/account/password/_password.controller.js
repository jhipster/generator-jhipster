(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('PasswordController', controller);

    controller.$inject = [
        'Auth',
        'Principal'
    ];
    /* @ngInject */
    function controller(Auth, Principal){

        var vm = this;
        vm.success = null;
        vm.error = null;
        vm.doNotMatch = null;

        activate();
        function activate(){
            Principal.identity().then(function(account) {
                vm.account = account;
            });
        }

        vm.changePassword = function () {
            if (vm.password !== vm.confirmPassword) {
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
