'use strict';

angular.module('<%=angularAppName%>')
    .factory('<%= entityClass %>Search', function ($resource) {
        return $resource('api/_search/<%= entityInstancePlural %>/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
