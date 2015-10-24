'use strict';

angular.module('<%=angularAppName%>')
    .factory('UsersSearch', function ($resource) {
        return $resource('api/_search/users/:query', {}, {
            'query': {
                method: 'GET',
                isArray: true
            }
        });
    });
