(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('Register', Register);

    Register.$inject = ['$resource'];

    function Register ($resource) {
        return $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName %>/api/register'<%} else { %>'api/register'<% } %>, {}, {});
    }
})();
