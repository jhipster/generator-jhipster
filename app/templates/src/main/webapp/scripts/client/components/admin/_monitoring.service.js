'use strict';

angular.module('<%=angularAppName%>')
    .factory('MonitoringService', function ($rootScope, $http) {
        return {
            getMetrics: function () {
                var promise = $http.get('metrics/metrics').then(function (response) {
                    return response.data;
                });
                return promise;
            },

            checkHealth: function () {
                var promise = $http.get('health').then(function (response) {
                    return response.data;
                });
                return promise;
            },

            threadDump: function () {
                var promise = $http.get('dump').then(function (response) {
                    return response.data;
                });
                return promise;
            }
        };
    });
