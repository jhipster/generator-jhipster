(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('<%= entityClass %>', factory);

    factory.$inject = ['$resource', 'DateUtils'];
    /* @ngInject */
    function factory($resource) {

        var actions = {
            'query': { method: 'GET', isArray: true}
        };

        var API_URL = 'api/_search/<%= entityInstance %>s/:query';

        var params = {};

        return $resource(API_URL, params, actions);
    }
})();
