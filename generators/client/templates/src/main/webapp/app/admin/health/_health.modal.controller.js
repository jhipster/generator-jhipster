(function() {
    'use strict';

    angular.module('<%=angularAppName%>')
        .controller('JhiHealthModalController', JhiHealthModalController);

    JhiHealthModalController.$inject = ['$uibModalInstance', 'currentHealth', 'baseName', 'subSystemName'];

    function JhiHealthModalController ($uibModalInstance, currentHealth, baseName, subSystemName) {
        var vm = this;

        vm.cancel = cancel;
        vm.currentHealth = currentHealth;
        vm.baseName = baseName;
        vm.subSystemName = subSystemName;

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();
