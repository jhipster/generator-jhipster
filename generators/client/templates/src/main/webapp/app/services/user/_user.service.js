(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('User', User);

    User.$inject = ['$resource'];

    function User ($resource) {
        var service = $resource(<% if(applicationType == 'gateway') { %>'uaa/api/account/users/:login'<%} else { %>'api/account/users/:login'<% } %>, {}, {
            'query': {method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'save': { method:'POST' },
            'update': { method:'PUT' },
            'delete':{ method:'DELETE'}
        });

        return service;
    }
})();
