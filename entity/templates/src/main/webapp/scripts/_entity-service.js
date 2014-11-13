'use strict';

<%= angularAppName %>.factory('<%= entityClass %>', function ($resource) {
        return $resource('app/rest/<%= entityInstance %>s/:<%=primaryKeyField.fieldName %>', {}, {
            'query': { method: 'GET', isArray: true},
            'get': { method: 'GET'}
        });
    });
