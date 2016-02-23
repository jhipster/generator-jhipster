'use strict';

angular.module('<%=angularAppName%>')
    .factory('AuthServerProvider', function loginService($http, $localStorage, $sessionStorage) {
        return {
            login: function(credentials) {
                var data = 'username=' +  encodeURIComponent(credentials.username) + '&password=' +
                    encodeURIComponent(credentials.password) + '&rememberMe=' +
                    encodeURIComponent(credentials.rememberMe);
                return $http.post('api/authenticate', data, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    }
                }).success(function (data, status, headers) {
                    var bearerToken = headers('Authorization');
                    if (bearerToken !== undefined && bearerToken.slice(0, 7) === 'Bearer ') {
                        var jwt = bearerToken.slice(7, bearerToken.length);
                        if(credentials.rememberMe){
                            $localStorage.authenticationToken = jwt;
                        } else {
                            $sessionStorage.authenticationToken = jwt;
                        }
                        return jwt;
                    }
                });
            },
            logout: function() {
                delete $localStorage.authenticationToken;
                delete $sessionStorage.authenticationToken;
            },
            getToken: function () {
                return $localStorage.authenticationToken || $sessionStorage.authenticationToken;
            },
            hasValidToken: function () {
                var token = this.getToken();
                return token && token.expires && token.expires > new Date().getTime();
            }
        };
    });
