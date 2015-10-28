(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('HealthModalController', controller);

    controller.$inject = [
        '$modalInstance',
        'currentHealth',
        'baseName',
        'subSystemName'
    ];
    /* @ngInject */
    function controller($modalInstance, currentHealth, baseName, subSystemName){

        var vm = this;
        vm.currentHealth = currentHealth;
        vm.baseName = baseName;
        vm.subSystemName = subSystemName;
        vm.cancel = cancel;

        activate();
        function activate(){

        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

    }
})();
