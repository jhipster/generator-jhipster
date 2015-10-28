(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('ResetFinishController', controller);

    controller.$inject = [
        '$stateParams',
        '$timeout',
        'Auth'
    ];
    /* @ngInject */
    function controller($stateParams, $timeout, Auth){

        var vm = this;
        vm.keyMissing = $stateParams.key === undefined;
        vm.doNotMatch = null;
        vm.resetAccount = {};
        vm.finishReset = finishReset;

        activate();
        function activate(){
            $timeout(function (){angular.element('[ng-model="resetAccount.password"]').focus();});
        }

        function finishReset() {
            if (vm.resetAccount.password !== vm.confirmPassword) {
                vm.doNotMatch = 'ERROR';
            } else {
                Auth.resetPasswordFinish({key: $stateParams.key, newPassword: vm.resetAccount.password}).then(function () {
                    vm.success = 'OK';
                }).catch(function (response) {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
            }
        }

    }
})();

