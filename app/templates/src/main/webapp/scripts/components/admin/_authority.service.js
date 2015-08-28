'use strict';

angular.module('<%=angularAppName%>')
    .factory('Authority', function ($resource) {
        return $resource('api/authorities/:name', {}, {
            'query': {method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            }
        });
    });
