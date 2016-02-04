'use strict';

angular.module('<%=angularAppName%>')
    .factory('HealthService', function ($rootScope, $http) {
        return {
            checkHealth: function () {
                return $http.get('health').then(function (response) {
                    return response.data;
                });
            }
        };
    });
