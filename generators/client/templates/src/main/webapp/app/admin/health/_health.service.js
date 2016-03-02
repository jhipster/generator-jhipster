(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('<%=jhiPrefix%>HealthService', <%=jhiPrefix%>HealthService);

    <%=jhiPrefix%>HealthService.$inject = ['$rootScope', '$http'];

    function <%=jhiPrefix%>HealthService ($rootScope, $http) {
        var service = {
            checkHealth: checkHealth
        };

        return service;

        function checkHealth () {
            return $http.get('health').then(function (response) {
                return response.data;
            });
        }
    }
})();
