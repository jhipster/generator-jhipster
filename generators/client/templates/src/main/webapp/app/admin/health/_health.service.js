(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('HealthService', HealthService);
        
    HealthService.$inject = ['$rootScope', '$http'];

    function HealthService ($rootScope, $http) {
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
