(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%=jhiPrefixCapitalized%>ConfigurationController', <%=jhiPrefixCapitalized%>ConfigurationController);

    <%=jhiPrefixCapitalized%>ConfigurationController.$inject = ['$filter','<%=jhiPrefixCapitalized%>ConfigurationService'];

    function <%=jhiPrefixCapitalized%>ConfigurationController (filter,<%=jhiPrefixCapitalized%>ConfigurationService) {
        var vm = this;

        vm.allConfiguration = null;
        vm.configuration = null;

        <%=jhiPrefixCapitalized%>ConfigurationService.get().then(function(configuration) {
            vm.configuration = configuration;
        });
        <%=jhiPrefixCapitalized%>ConfigurationService.getEnv().then(function (configuration) {
            vm.allConfiguration = configuration;
        });
    }
})();
