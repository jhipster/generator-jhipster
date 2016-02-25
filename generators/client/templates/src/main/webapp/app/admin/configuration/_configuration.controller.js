(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('ConfigurationController', ConfigurationController);

    ConfigurationController.$inject = ['$filter','ConfigurationService'];

    function ConfigurationController (filter,ConfigurationService) {
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
