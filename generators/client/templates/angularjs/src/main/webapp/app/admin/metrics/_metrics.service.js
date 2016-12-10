(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('<%=jhiPrefixCapitalized%>MetricsService', <%=jhiPrefixCapitalized%>MetricsService);

    <%=jhiPrefixCapitalized%>MetricsService.$inject = ['$rootScope', '$http'];

    function <%=jhiPrefixCapitalized%>MetricsService ($rootScope, $http) {
        var service = {
            getMetrics: getMetrics,
            threadDump: threadDump
        };

        return service;

        function getMetrics () {
            return $http.get('management/metrics').then(function (response) {
                return response.data;
            });
        }

        function threadDump () {
            return $http.get('management/dump').then(function (response) {
                return response.data;
            });
        }
    }
})();
