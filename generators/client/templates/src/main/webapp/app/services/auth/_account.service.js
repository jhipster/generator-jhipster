(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('Account', Account);

    Account.$inject = ['$resource'];

    function Account ($resource) {
        var service = $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account'<%} else { %>'api/account'<% } %>, {}, {
            'get': { method: 'GET', params: {}, isArray: false,
                interceptor: {
                    response: function(response) {
                        // expose response
                        return response;
                    }
                }
            }
        });

        return service;
    }
})();
