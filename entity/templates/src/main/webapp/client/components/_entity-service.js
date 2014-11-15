'use strict';

angular.module('<%=angularAppName%>')
    .factory('<%= entityClass %>', function ($resource) {
        return $resource('app/rest/<%= entityInstance %>s/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': { method: 'GET'}
        });
    });
