'use strict';

angular.module('<%=angularAppName%>')
    .factory('AuditsService', function ($resource, DateUtils) {
        return $resource('api/audits/:id', {}, {
            'get': {
                method: 'GET',
                isArray: true
            },
            'query': {
                method: 'GET',
                isArray: true,
                params: {fromDate: null, toDate: null}
            }
        })
    });
