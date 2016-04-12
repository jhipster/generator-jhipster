(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('authInterceptor', authInterceptor);

    authInterceptor.$inject = ['$rootScope', '$q', '$location', '$localStorage', '$sessionStorage'];

    function authInterceptor ($rootScope, $q, $location, $localStorage, $sessionStorage) {
        var service = {
            request: request
        };

        return service;

        function request (config) {
            /*jshint camelcase: false */
            config.headers = config.headers || {};
            var token = $localStorage.authenticationToken || $sessionStorage.authenticationToken;
            <% if (authenticationType === 'oauth2') { %>
            if (token && token.expires_at && token.expires_at > new Date().getTime()) {
                config.headers.Authorization = 'Bearer ' + token.access_token;
            }
            <% } %><% if (authenticationType === 'jwt' || authenticationType === 'uaa') { %>
            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }
            <% } %>
            return config;
        }
    }
})();
