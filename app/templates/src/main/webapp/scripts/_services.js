'use strict';

/* Services */

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

<%= angularAppName %>.factory('Metrics', ['$resource',
    function ($resource) {
        return $resource('metrics/metrics', {}, {
            'get': { method: 'GET'}
        });
    }]);

<%= angularAppName %>.factory('HealthCheckService', ['$rootScope', '$http',
    function ($rootScope, $http) {
        return {
            check: function() {
                var promise = $http.get('metrics/healthcheck').then(function(response){
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

<%= angularAppName %>.factory('AuthenticationSharedService', ['$rootScope', '$http', 'authService',
    function ($rootScope, $http, authService) {
        return {
            authenticate: function() {
               var promise = $http.get('app/rest/authenticate')
                    .success(function (response) {
                        return response.data;
                    });
                return promise;
            },
            login: function (param) {
                var data ="j_username=" + param.username +"&j_password=" + param.password +"&_spring_security_remember_me=" + param.rememberMe +"&submit=Login";
                $http.post('app/authentication', data, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    ignoreAuthModule: 'ignoreAuthModule'
                }).success(function (data, status, headers, config) {
                    $rootScope.authenticationError = false;
                    if(param.success){
                        param.success(data, status, headers, config);
                    }
                }).error(function (data, status, headers, config) {
                    $rootScope.authenticationError = true;
                    if(param.error){
                        param.error(data, status, headers, config);
                    }
                });
            },
            logout: function () {
                $rootScope.authenticationError = false;
                $http.get('app/logout')
                    .success(function (data, status, headers, config) {
                        authService.loginCancelled();
                    });
            }
        };
    }]);
