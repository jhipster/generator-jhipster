(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('ConfigurationController', ConfigurationController);

    ConfigurationController.$inject = ['$filter','JhiConfigurationService'];

    function ConfigurationController (filter,JhiConfigurationService) {
        var vm = this;

        vm.allConfiguration = null;
        vm.configuration = null;

        JhiConfigurationService.get().then(function(configuration) {
            vm.configuration = configuration;
        });
        JhiConfigurationService.getEnv().then(function (configuration) {
            vm.allConfiguration = configuration;
        });
    }
})();
