'use strict';

<%= angularAppName %>.factory('<%= entityClass %>', function ($resource) {
        return $resource('app/rest/<%= entityInstance %>s/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': { method: 'GET'}
        });
    });
