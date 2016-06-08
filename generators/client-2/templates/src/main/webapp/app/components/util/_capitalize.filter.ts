(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>.common')
        .filter('capitalize', capitalize);

    function capitalize() {
        return capitalizeFilter;

        function capitalizeFilter (input) {
            if (input !== null) {
                input = input.toLowerCase();
            }
            return input.substring(0, 1).toUpperCase() + input.substring(1);
        }
    }
})();
