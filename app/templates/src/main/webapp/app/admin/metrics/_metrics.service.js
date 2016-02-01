'use strict';

angular.module('<%=angularAppName%>')
    .factory('MetricsService', function ($rootScope, $http) {
        return {
            getMetrics: function () {
                return $http.get('metrics/metrics').then(function (response) {
                    return response.data;
                });
            },

            threadDump: function () {
                return $http.get('dump').then(function (response) {
                    return response.data;
                });
            }
        };
    });
