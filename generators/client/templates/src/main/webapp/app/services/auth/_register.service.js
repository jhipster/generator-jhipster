(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('Register', Register);

    Register.$inject = ['$resource'];

    function Register ($resource) {
        return $resource(<%= if(applicationType == 'gateway') { %>'uaa/api/register'<%} else { %>'api/register'<% } %>, {}, {});
    }
})();
