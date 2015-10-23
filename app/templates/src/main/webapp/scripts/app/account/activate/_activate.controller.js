(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>.account.activate')
        .controller('ActivationController', controller);

    controller.$inject = [
        '$stateParams',
        'Auth'];
    /* @ngInject */
    function controller ($stateParams, Auth){

        var vm = this;

        Auth.activateAccount({key: $stateParams.key}).then(function () {
            vm.error = null;
            vm.success = 'OK';
        }).catch(function () {
            vm.success = null;
            vm.error = 'ERROR';
        });
    }
})();

