'use strict';

angular.module('<%=angularAppName%>')
    .factory('AuthServerProvider', function loginService($http, localStorageService, Base64) {
        return {
            login: function(credentials) {
                var data = "username=" +  encodeURIComponent(credentials.username) + "&password="
                    + encodeURIComponent(credentials.password);
                return $http.post('api/authenticate', data, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json"
                    }
                }).success(function (data, status, headers) {
                    var jwt = headers('X-JHipster-authentication');
                    localStorageService.set('authentication-token', jwt);
                    return jwt;
                });
            },
            logout: function() {
                localStorageService.clearAll();
            },
            getToken: function () {
                return localStorageService.get('authentication-token');
            },
            hasValidToken: function () {
                var token = this.getToken();
                return token && token.expires && token.expires > new Date().getTime();
            }
        };
    });
