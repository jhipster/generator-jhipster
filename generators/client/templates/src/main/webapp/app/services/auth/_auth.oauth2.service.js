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
            hasValidToken: hasValidToken,
            login: login,
            logout: logout
        };

        return service;

        function getToken () {
            return $localStorage.authenticationToken;
        }

        function hasValidToken () {
            var token = this.getToken();
            return token && token.expires_at && token.expires_at > new Date().getTime();
        }

        function login (credentials) {
            var data = 'username=' +  encodeURIComponent(credentials.username) + '&password=' +
                encodeURIComponent(credentials.password) + '&grant_type=password&scope=read%20write&' +
                'client_secret=mySecretOAuthSecret&client_id=<%= baseName%>app';

            return $http.post('oauth/token', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Authorization': 'Basic ' + Base64.encode('<%= baseName%>app' + ':' + 'mySecretOAuthSecret')
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
