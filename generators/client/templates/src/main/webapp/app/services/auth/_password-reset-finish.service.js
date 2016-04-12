(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('PasswordResetFinish', PasswordResetFinish);

    PasswordResetFinish.$inject = ['$resource'];

    function PasswordResetFinish($resource) {
        var service = $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName %>/api/account/reset_password/finish'<%} else { %>'api/account/reset_password/finish'<% } %>, {}, {});

        return service;
    }
})();
