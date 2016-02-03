'use strict';

angular.module('<%=angularAppName%>')
    .factory('<%= entityClass %>Search', function ($resource) {
        return $resource('api/_search/<%= entityApiUrl %>/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
