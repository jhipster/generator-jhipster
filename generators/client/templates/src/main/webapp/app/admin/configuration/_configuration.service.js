(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('<%=jhiPrefix%>ConfigurationService', <%=jhiPrefix%>ConfigurationService);

    <%=jhiPrefix%>ConfigurationService.$inject = ['$filter', '$http'];

    function <%=jhiPrefix%>ConfigurationService ($filter, $http) {
        var service = {
            get: get,
            getEnv: getEnv
        };

        return service;

        function get () {
            return $http.get('configprops').then(getConfigPropsComplete);

            function getConfigPropsComplete (response) {
                var properties = [];
                angular.forEach(response.data, function (data) {
                    properties.push(data);
                });
                var orderBy = $filter('orderBy');
                return orderBy(properties, 'prefix');
            }
        }

        function getEnv () {
            return $http.get('env').then(getEnvComplete);

            function getEnvComplete (response) {
                var properties = {};
                angular.forEach(response.data, function (val,key) {
                    var vals = [];
                    angular.forEach(val, function (v,k) {
                        vals.push({ key:k, val:v });
                    });
                    properties[key] = vals;
                });
                return properties;
            }
        }
    }
})();
