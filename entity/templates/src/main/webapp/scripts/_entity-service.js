'use strict';

<%= angularAppName %>.factory('<%= entityClass %>', ['$resource',
    function ($resource) {
        return $resource('app/rest/<%= entityInstance %>s/:id', {}, {
            'get': { method: 'GET', isArray: true}
        });
    }]);
