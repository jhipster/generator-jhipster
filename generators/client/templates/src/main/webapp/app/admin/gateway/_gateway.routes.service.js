'use strict';

angular.module('<%=angularAppName%>')
    .factory('GatewayRoutes', function ($resource) {
        return $resource('api/gateway/routes/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
