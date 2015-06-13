'use strict';

angular.module('<%=angularAppName%>')
    .factory('userManagement', function ($resource) {
        return $resource('api/userManagement/:login', {}, {
                'query': {method: 'GET', isArray: true},
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
