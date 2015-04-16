'use strict';

angular.module('<%=angularAppName%>')
    .factory('<%= entityClass %>Search', function ($resource) {
        return $resource('api/_search/<%= entityInstance %>s/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
