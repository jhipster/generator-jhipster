'use strict';

angular.module('<%=angularAppName%>')
    .factory('AuthServerProvider', function loginService($http, localStorageService, Base64) {
        return {
            login: function(credentials) {
                var data = "username=" + credentials.username + "&password="
                    + credentials.password + "&grant_type=password&scope=read%20write&" +
                    "client_secret=mySecretOAuthSecret&client_id=<%= baseName%>app";
                return $http.post('oauth/token', data, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json",
                        "Authorization": "Basic " + Base64.encode("<%= baseName%>app" + ':' + "mySecretOAuthSecret")
                    }
                }).success(function (response) {
                    var expiredAt = new Date();
                    expiredAt.setSeconds(expiredAt.getSeconds() + response.expires_in);
                    response.expires_at = expiredAt.getTime();
                    localStorageService.set('token', response);
                    return response;
                });
            },
            logout: function() {
                // logout from the server
                $http.post('api/logout').then(function() {
                    localStorageService.clearAll();
                });
            },
            getToken: function () {
                return localStorageService.get('token');
            },
            hasValidToken: function () {
                var token = this.getToken();
                return token && token.expires_at && token.expires_at > new Date().getTime();
            }
        };
    });
