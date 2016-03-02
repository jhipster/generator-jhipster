(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('<%=jhiPrefix%>MetricsService', <%=jhiPrefix%>MetricsService);

    <%=jhiPrefix%>MetricsService.$inject = ['$rootScope', '$http'];

    function <%=jhiPrefix%>MetricsService ($rootScope, $http) {
        var service = {
            getMetrics: getMetrics,
            threadDump: threadDump
        };

        return service;

        function getMetrics () {
            return $http.get('metrics/metrics').then(function (response) {
                return response.data;
            });
        }

        function threadDump () {
            return $http.get('dump').then(function (response) {
                return response.data;
            });
        }
    }
})();
