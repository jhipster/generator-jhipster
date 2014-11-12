'use strict';

angular.module('<%=angularAppName%>')
    .factory('Activate', function ($resource) {
        return $resource('app/rest/activate', {}, {
            'get': { method: 'GET', params: {}, isArray: false}
        });
    });


