(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('Sessions', Sessions);

    Sessions.$inject = ['$resource'];

    function Sessions ($resource) {
        return $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account/sessions/:series'<%} else { %>'api/account/sessions/:series'<% } %>, {}, {
            'getAll': { method: 'GET', isArray: true}
        });
    }
})();
