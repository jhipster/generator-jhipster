(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('RequestResetController', controller);

    controller.$inject = [
        '$rootScope',
        '$state',
        '$timeout',
        'Auth'
    ];
    /* @ngInject */
    function controller($rootScope, $state, $timeout, Auth){

        var vm = this;
        vm.success = null;
        vm.error = null;
        vm.errorEmailNotExists = null;
        vm.resetAccount = {};

        activate();
        function activate(){
            $timeout(function (){angular.element('[ng-model="resetAccount.email"]').focus();});
        }

        vm.requestReset = function () {

            vm.error = null;
            vm.errorEmailNotExists = null;

            Auth.resetPasswordInit(vm.resetAccount.email).then(function () {
                vm.success = 'OK';
            }).catch(function (response) {
                vm.success = null;
                if (response.status === 400 && response.data === 'e-mail address not registered') {
                    vm.errorEmailNotExists = 'ERROR';
                } else {
                    vm.error = 'ERROR';
                }
            });
        }
    }
})();
