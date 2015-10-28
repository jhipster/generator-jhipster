(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('ConfigurationController', controller);

    controller.$inject = ['ConfigurationService'];
    /* @ngInject */
    function controller(ConfigurationService){

        var vm = this;

        activate();
        function activate(){
            ConfigurationService.get().then(function(configuration) {
                vm.configuration = configuration;
            });
        }

    }
})();
