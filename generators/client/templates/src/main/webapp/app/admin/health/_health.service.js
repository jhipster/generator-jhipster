(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('<%=jhiPrefixCapitalized%>HealthService', <%=jhiPrefixCapitalized%>HealthService);

    <%=jhiPrefixCapitalized%>HealthService.$inject = ['$rootScope', '$http'];

    function <%=jhiPrefixCapitalized%>HealthService ($rootScope, $http) {
        var service = {
            checkHealth: checkHealth
        };

        return service;

        function checkHealth () {
            return $http.get('management/health').then(function (response) {
                return response.data;
            });
        }
    }
})();
