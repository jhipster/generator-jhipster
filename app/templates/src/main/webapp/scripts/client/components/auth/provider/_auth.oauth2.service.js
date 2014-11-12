'use strict';

angular.module('<%=angularAppName%>')
    .factory('AuthServerProvider', function loginService($http, localStorageService, Base64) {
        return {
            login: function(credentials) {
                var data = "username=" + credentials.username + "&password="
                    + credentials.password + "&grant_type=password&scope=read%20write&" +
                    "client_secret=mySecretOAuthSecret&client_id=<%= baseName%>app";
                $http.post('oauth/token', data, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json",
                        "Authorization": "Basic " + Base64.encode("<%= baseName%>app" + ':' + "mySecretOAuthSecret")
                    }
                }).success(function (data) {
                    localStorageService.set('token', data);
                    return data;
                });
            },
            logout: function() {
                localStorageService.clearAll();

                // logout from the server
                $http.get('app/logout');
            },
            getToken: function () {
                return localStorageService.get('token');
            },
            hasValidToken: function () {
                var token = this.getToken();
                return token && token.expires_at && token.expires_at < new Date().getTime();
            }
        };
    });

