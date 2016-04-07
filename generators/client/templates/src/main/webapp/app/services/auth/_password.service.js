(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('Password', Password);

    Password.$inject = ['$resource'];

    function Password($resource) {
        var service = $resource(<% if(authenticationType == 'uaa') { %>'uaa/api/account/change_password'<%} else { %>'api/account/change_password'<% } %>, {}, {});

        return service;
    }
})();
