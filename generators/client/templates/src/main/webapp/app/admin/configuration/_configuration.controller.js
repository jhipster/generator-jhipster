(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%=jhiPrefix%>ConfigurationController', <%=jhiPrefix%>ConfigurationController);

    <%=jhiPrefix%>ConfigurationController.$inject = ['$filter','<%=jhiPrefix%>ConfigurationService'];

    function <%=jhiPrefix%>ConfigurationController (filter,<%=jhiPrefix%>ConfigurationService) {
        var vm = this;

        vm.allConfiguration = null;
        vm.configuration = null;

        <%=jhiPrefix%>ConfigurationService.get().then(function(configuration) {
            vm.configuration = configuration;
        });
        <%=jhiPrefix%>ConfigurationService.getEnv().then(function (configuration) {
            vm.allConfiguration = configuration;
        });
    }
})();
