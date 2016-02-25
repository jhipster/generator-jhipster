(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('ConfigurationController', ConfigurationController);

    ConfigurationController.$inject = ['ConfigurationService'];

    function ConfigurationController (ConfigurationService) {
        var vm = this;

        vm.allConfiguration = null;
        vm.configuration = null;

        ConfigurationService.get().then(function(configuration) {
            vm.configuration = configuration;
        });
        ConfigurationService.getEnv().then(function (configuration) {
            vm.allConfiguration = configuration;
        });
    }
})();
