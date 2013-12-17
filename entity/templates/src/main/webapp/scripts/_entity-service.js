'use strict';

<%= angularAppName %>.factory('<%= entityClass %>', ['$resource',
    function ($resource) {
        return $resource('app/rest/<%= entityInstance %>s/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': { method: 'GET'}
        });
    }]);
