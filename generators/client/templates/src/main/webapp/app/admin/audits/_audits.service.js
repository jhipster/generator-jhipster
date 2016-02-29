(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('AuditsService', AuditsService);

    AuditsService.$inject = ['$resource'];

    function AuditsService ($resource) {
        var service = $resource('api/audits/:id', {}, {
            'get': {
                method: 'GET',
                isArray: true
            },
            'query': {
                method: 'GET',
                isArray: true,
                params: {fromDate: null, toDate: null}
            }
        });

        return service;
    }
})();
