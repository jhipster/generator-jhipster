/*global angular:true, browser:true */

/**
 * @license HTTP Auth Interceptor Module for AngularJS
 * (c) 2012 Witold Szczerba
 * License: MIT
 */
(function () {
    'use strict';

    angular.module('http-auth-interceptor', ['http-auth-interceptor-buffer'])

        .factory('authService', ['$rootScope','httpBuffer', function($rootScope, httpBuffer) {
            return {
                /**
                 * Call this function to indicate that authentication was successfull and trigger a
                 * retry of all deferred requests.
                 * @param data an optional argument to pass on to $broadcast which may be useful for
                 * example if you need to pass through details of the user that was logged in
                 */
                loginConfirmed: function(data, configUpdater) {
                    var updater = configUpdater || function(config) {return config;};
                    $rootScope.$broadcast('event:auth-loginConfirmed', data);
                    httpBuffer.retryAll(updater);
                },

                /**
                 * Call this function to indicate that authentication should not proceed.
                 * All deferred requests will be abandoned or rejected (if reason is provided).
                 * @param data an optional argument to pass on to $broadcast.
                 * @param reason if provided, the requests are rejected; abandoned otherwise.
                 */
                loginCancelled: function(data, reason) {
                    httpBuffer.rejectAll(reason);
                    $rootScope.$broadcast('event:auth-loginCancelled', data);
                }
            };
        }])

    /**
     * $http interceptor.
     * On 401 response (without 'ignoreAuthModule' option) stores the request
     * and broadcasts 'event:angular-auth-loginRequired'.
     */
        .config(['$httpProvider', function($httpProvider) {

            var interceptor = ['$rootScope', '$q', 'httpBuffer', function($rootScope, $q, httpBuffer) {
                function success(response) {
                    return response;
                }

                function error(response) {
                    if (response.status === 401 && !response.config.ignoreAuthModule) {
                        var deferred = $q.defer();
                        httpBuffer.append(response.config, deferred);
                        $rootScope.$broadcast('event:auth-loginRequired', response);
                        return deferred.promise;
                    }
                    // otherwise, default behaviour
                    return $q.reject(response);
                }

                return function(promise) {
                    return promise.then(success, error);
                };

            }];
            $httpProvider.responseInterceptors.push(interceptor);
        }]);

    /**
     * Private module, a utility, required internally by 'http-auth-interceptor'.
     */
    angular.module('http-auth-interceptor-buffer', [])

        .factory('httpBuffer', ['$injector', function($injector) {
            /** Holds all the requests, so they can be re-requested in future. */
            var buffer = [];

            /** Service initialized later because of circular dependency problem. */
            var $http;

            function retryHttpRequest(config, deferred) {
                function successCallback(response) {
                    deferred.resolve(response);
                }
                function errorCallback(response) {
                    deferred.reject(response);
                }
                $http = $http || $injector.get('$http');
                $http(config).then(successCallback, errorCallback);
            }

            return {
                /**
                 * Appends HTTP request configuration object with deferred response attached to buffer.
                 */
                append: function(config, deferred) {
                    buffer.push({
                        config: config,
                        deferred: deferred
                    });
                },

                /**
                 * Abandon or reject (if reason provided) all the buffered requests.
                 */
                rejectAll: function(reason) {
                    if (reason) {
                        for (var i = 0; i < buffer.length; ++i) {
                            buffer[i].deferred.reject(reason);
                        }
                    }
                    buffer = [];
                },

                /**
                 * Retries all the buffered requests clears the buffer.
                 */
                retryAll: function(updater) {
                    for (var i = 0; i < buffer.length; ++i) {
                        retryHttpRequest(updater(buffer[i].config), buffer[i].deferred);
                    }
                    buffer = [];
                }
            };
        }]);
})();