(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('PasswordResetInit', PasswordResetInit);

    PasswordResetInit.$inject = ['$resource'];

    function PasswordResetInit($resource) {
        var service = $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account/reset_password/init'<%} else { %>'api/account/reset_password/init'<% } %>, {}, {});

        return service;
    }
})();
