(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('<%= entityClass %>Search', <%= entityClass %>Search);

    <%= entityClass %>Search.$inject = ['$resource'];

    function <%= entityClass %>Search($resource) {
        return $resource('api/_search/<%= entityApiUrl %>/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    }
})();
