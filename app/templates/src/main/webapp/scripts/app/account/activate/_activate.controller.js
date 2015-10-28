(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('ActivationController', controller);

    controller.$inject = [
        '$stateParams',
        'Auth'];
    /* @ngInject */
    function controller ($stateParams, Auth){

        var vm = this;

        activate();
        function activate(){
            Auth.activateAccount({key: $stateParams.key}).then(function () {
                vm.error = null;
                vm.success = 'OK';
            }).catch(function () {
                vm.success = null;
                vm.error = 'ERROR';
            });
        }

    }
})();

