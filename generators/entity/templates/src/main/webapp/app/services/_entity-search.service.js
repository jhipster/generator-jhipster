(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('<%= entityClass %>Search', <%= entityClass %>Search);

    <%= entityClass %>Search.$inject = ['$resource'];

    function <%= entityClass %>Search($resource) {
        var resourceUrl = <% if (applicationType == 'gateway' && locals.microserviceName) {%> '<%= microserviceName.toLowerCase() %>/' +<% } %> 'api/_search/<%= entityApiUrl %>/:id';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true}
        });
    }
})();
