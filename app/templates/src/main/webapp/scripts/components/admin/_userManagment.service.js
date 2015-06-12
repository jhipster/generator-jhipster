'use strict';

angular.module('<%=angularAppName%>')
    .factory('UserManagment', function ($resource) {
        return $resource('api/userManagment/:id', {}, {
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
