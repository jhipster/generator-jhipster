(function() {
    /*jshint camelcase: false */
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('AuthServerProvider', AuthServerProvider);

    AuthServerProvider.$inject = ['$http', '$localStorage', 'Base64'];

    function AuthServerProvider ($http, $localStorage, Base64) {
        var service = {
            getToken: getToken,
            login: login,
            logout: logout
        };

        return service;

        function getToken () {
            return $localStorage.authenticationToken;
        }

        function login (credentials) {
            var data = 'username=' +  encodeURIComponent(credentials.username) + '&password=' +
                encodeURIComponent(credentials.password) + '&grant_type=password&scope=read%20write&' +
                'client_secret=my-secret-token-to-change-in-production&client_id=<%= baseName%>app';

            return $http.post('oauth/token', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Authorization': 'Basic ' + Base64.encode('<%= baseName%>app' + ':' + 'my-secret-token-to-change-in-production')
                }
            }).success(authSucess);

            function authSucess (response) {
                var expiredAt = new Date();
                expiredAt.setSeconds(expiredAt.getSeconds() + response.expires_in);
                response.expires_at = expiredAt.getTime();
                $localStorage.authenticationToken = response;
                return response;
            }
        }

        function logout () {
            $http.post('api/logout').then(function() {
                delete $localStorage.authenticationToken;
            });
        }
    }
})();
