/*jshint camelcase: false */
'use strict';

angular.module('<%=angularAppName%>')
    .factory('AuthServerProvider', function loginService($http, $localStorage, Base64) {
        return {
            login: function(credentials) {
                var data = 'username=' +  encodeURIComponent(credentials.username) + '&password=' +
                    encodeURIComponent(credentials.password) + '&grant_type=password&scope=read%20write&' +
                    'client_secret=mySecretOAuthSecret&client_id=<%= baseName%>app';
                return $http.post('oauth/token', data, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'Authorization': 'Basic ' + Base64.encode('<%= baseName%>app' + ':' + 'mySecretOAuthSecret')
                    }
                }).success(function (response) {
                    var expiredAt = new Date();
                    expiredAt.setSeconds(expiredAt.getSeconds() + response.expires_in);
                    response.expires_at = expiredAt.getTime();
                    $localStorage.authenticationToken = response;
                    return response;
                });
            },
            logout: function() {
                // logout from the server
                $http.post('api/logout').then(function() {
                    delete $localStorage.authenticationToken;
                });
            },
            getToken: function () {
                return $localStorage.authenticationToken;
            },
            hasValidToken: function () {
                var token = this.getToken();
                return token && token.expires_at && token.expires_at > new Date().getTime();
            }
        };
    });
