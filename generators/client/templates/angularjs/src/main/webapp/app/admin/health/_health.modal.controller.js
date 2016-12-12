(function() {
    'use strict';

    angular.module('<%=angularAppName%>')
        .controller('HealthModalController', HealthModalController);

    HealthModalController.$inject = ['$uibModalInstance', 'currentHealth', 'baseName', 'subSystemName'];

    function HealthModalController ($uibModalInstance, currentHealth, baseName, subSystemName) {
        var vm = this;

        vm.cancel = cancel;
        vm.currentHealth = currentHealth;
        vm.baseName = baseName;
        vm.subSystemName = subSystemName;

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        vm.getProperValue = function(value) {
            if (vm.currentHealth.name == "diskSpace") {
                if (value / 1073741824 > 1)
                    return (value / 1073741824).toFixed(2) + " GB";
                return (value / 1048576, 2).toFixed(2) + " MB";
            }
            return value;
        }
    }
})();
