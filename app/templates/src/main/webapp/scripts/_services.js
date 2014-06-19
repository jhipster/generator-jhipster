'use strict';

/* Services */

<%= angularAppName %>.factory('Register', ['$resource',
    function ($resource) {
        return $resource('app/rest/register', {}, {
        });
    }]);

<%= angularAppName %>.factory('Activate', ['$resource',
    function ($resource) {
        return $resource('app/rest/activate', {}, {
            'get': { method: 'GET', params: {}, isArray: false}
        });
    }]);

<%= angularAppName %>.factory('Account', ['$resource',
    function ($resource) {
        return $resource('app/rest/account', {}, {
        });
    }]);

<%= angularAppName %>.factory('Password', ['$resource',
    function ($resource) {
        return $resource('app/rest/account/change_password', {}, {
        });
    }]);

<%= angularAppName %>.factory('Sessions', ['$resource',
    function ($resource) {
        return $resource('app/rest/account/sessions/:series', {}, {
            'get': { method: 'GET', isArray: true}
        });
    }]);

<%= angularAppName %>.factory('MetricsService', ['$resource',
    function ($resource) {
        return $resource('metrics/metrics', {}, {
            'get': { method: 'GET'}
        });
    }]);

<%= angularAppName %>.factory('ThreadDumpService', ['$http',
    function ($http) {
        return {
            dump: function() {
                var promise = $http.get('dump').then(function(response){
                    return response.data;
                });
                return promise;
            }
        };
    }]);

<%= angularAppName %>.factory('HealthCheckService', ['$rootScope', '$http',
    function ($rootScope, $http) {
        return {
            check: function() {
                var promise = $http.get('health').then(function(response){
                    return response.data;
                });
                return promise;
            }
        };
    }]);

<%= angularAppName %>.factory('LogsService', ['$resource',
    function ($resource) {
        return $resource('app/rest/logs', {}, {
            'findAll': { method: 'GET', isArray: true},
            'changeLevel':  { method: 'PUT'}
        });
    }]);

<%= angularAppName %>.factory('AuditsService', ['$http',
    function ($http) {
        return {
            findAll: function() {
                var promise = $http.get('app/rest/audits/all').then(function (response) {
                    return response.data;
                });
                return promise;
            },
            findByDates: function(fromDate, toDate) {
                var promise = $http.get('app/rest/audits/byDates', {params: {fromDate: fromDate, toDate: toDate}}).then(function (response) {
                    return response.data;
                });
                return promise;
            }
        }
    }]);

<%= angularAppName %>.factory('Session', [
    function () {
        this.create = function (login, firstName, lastName, email, userRoles) {
            this.login = login;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.userRoles = userRoles;
        };
        this.invalidate = function () {
            this.login = null;
            this.firstName = null;
            this.lastName = null;
            this.email = null;
            this.userRoles = null;
        };
        return this;
    }]);

<%= angularAppName %>.constant('USER_ROLES', {
        all: '*',
        admin: 'ROLE_ADMIN',
        user: 'ROLE_USER'
    });

<%= angularAppName %>.factory('AuthenticationSharedService', ['$rootScope', '$http', 'authService', 'Session', 'Account',<% if (authenticationType == 'token') { %> 'Base64Service', 'AccessToken', <% } %>
    function ($rootScope, $http, authService, Session, Account<% if (authenticationType == 'token') { %>, Base64Service, AccessToken<% } %>) {
        return {
            login: function (param) {<% if (authenticationType == 'cookie') { %>
                var data ="j_username=" + param.username +"&j_password=" + param.password +"&_spring_security_remember_me=" + param.rememberMe +"&submit=Login";
                $http.post('app/authentication', data, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    ignoreAuthModule: 'ignoreAuthModule'
                }).success(function (data, status, headers, config) {
                    Account.get(function(data) {
                        Session.create(data.login, data.firstName, data.lastName, data.email, data.roles);
                        $rootScope.account = Session;
                        authService.loginConfirmed(data);
                    });
                }).error(function (data, status, headers, config) {
                    $rootScope.authenticationError = true;
                    Session.invalidate();
                });<% } %><% if (authenticationType == 'token') { %>
                var data = "username=" + param.username + "&password=" + param.password + "&grant_type=password&scope=read%20write&client_secret=mySecretOAuthSecret&client_id=<%= baseName%>app";
                $http.post('oauth/token', data, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json",
                        "Authorization": "Basic " + Base64Service.encode("<%= baseName%>app" + ':' + "mySecretOAuthSecret")
                    },
                    ignoreAuthModule: 'ignoreAuthModule'
                }).success(function (data, status, headers, config) {
                    httpHeaders.common['Authorization'] = 'Bearer ' + data.access_token;
                    AccessToken.set(data);

                    Account.get(function(data) {
                        Session.create(data.login, data.firstName, data.lastName, data.email, data.roles);
                        $rootScope.account = Session;
                        authService.loginConfirmed(data);
                    });
                }).error(function (data, status, headers, config) {
                    $rootScope.authenticationError = true;
                    Session.invalidate();
                });<% } %>
            },
            valid: function (authorizedRoles) {<% if (authenticationType == 'token') { %>
                if(AccessToken.get() !== null) {
                    httpHeaders.common['Authorization'] = 'Bearer ' + AccessToken.get();
                }<% } %>

                $http.get('protected/transparent.gif', {
                    ignoreAuthModule: 'ignoreAuthModule'
                }).success(function (data, status, headers, config) {
                    if (!Session.login<% if (authenticationType == 'token') { %> || AccessToken.get() != undefined<% } %>) {<% if (authenticationType == 'token') { %>
                        if (AccessToken.get() == undefined || AccessToken.expired()) {
                            $rootScope.authenticated = false
                            return;
                        }<% } %>
                        Account.get(function(data) {
                            Session.create(data.login, data.firstName, data.lastName, data.email, data.roles);
                            $rootScope.account = Session;

                            if (!$rootScope.isAuthorized(authorizedRoles)) {
                                event.preventDefault();
                                // user is not allowed
                                $rootScope.$broadcast("event:auth-notAuthorized");
                            }

                            $rootScope.authenticated = true;
                        });
                    }
                    $rootScope.authenticated = !!Session.login;
                }).error(function (data, status, headers, config) {
                    $rootScope.authenticated = false;
                });
            },
            isAuthorized: function (authorizedRoles) {
                if (!angular.isArray(authorizedRoles)) {
                    if (authorizedRoles == '*') {
                        return true;
                    }

                    authorizedRoles = [authorizedRoles];
                }

                var isAuthorized = false;
                angular.forEach(authorizedRoles, function(authorizedRole) {
                    var authorized = (!!Session.login &&
                        Session.userRoles.indexOf(authorizedRole) !== -1);

                    if (authorized || authorizedRole == '*') {
                        isAuthorized = true;
                    }
                });

                return isAuthorized;
            },
            logout: function () {
                $rootScope.authenticationError = false;
                $rootScope.authenticated = false;
                $rootScope.account = null;<% if (authenticationType == 'token') { %>
                AccessToken.remove();<% } %>

                $http.get('app/logout');
                Session.invalidate();<% if (authenticationType == 'token') { %>
                delete httpHeaders.common['Authorization'];<% } %>
                authService.loginCancelled();
            }
        };
    }]);
