'use strict';

/* App Module */

var <%= angularAppName %> = angular.module('<%= angularAppName %>', ['ngResource', 'ngRoute', 'ngCookies', 'pascalprecht.translate']);

<%= angularAppName %>
    .config(['$routeProvider', '$httpProvider', '$translateProvider',
        function ($routeProvider, $httpProvider, $translateProvider) {
            $routeProvider
                .when('/login', {
                    templateUrl: 'views/login.html',
                    controller: 'LoginController'
                })
                .when('/settings', {
                    templateUrl: 'views/settings.html',
                    controller: 'SettingsController',
                    resolve:{
                        resolvedAccount:['Account', function (Account) {
                            return Account.get();
                        }]
                    }
                })
                .when('/password', {
                    templateUrl: 'views/password.html',
                    controller: 'PasswordController'
                })
                .when('/sessions', {
                    templateUrl: 'views/sessions.html',
                    controller: 'SessionsController',
                    resolve:{
                        resolvedSessions:['Sessions', function (Sessions) {
                            return Sessions.get();
                        }]
                    }
                })
                .when('/metrics', {
                    templateUrl: 'views/metrics.html',
                    controller: 'MetricsController',
                    resolve:{
                        resolvedMetrics:['Metrics', function (Metrics) {
                            return Metrics.get();
                        }]
                    }
                })
                .when('/logs', {
                    templateUrl: 'views/logs.html',
                    controller: 'LogsController',
                    resolve:{
                        resolvedLogs:['LogsService', function (LogsService) {
                            return LogsService.findAll();
                        }]
                    }
                })
                .when('/logout', {
                    templateUrl: 'views/main.html',
                    controller: 'LogoutController'
                })
                .otherwise({
                    templateUrl: 'views/main.html',
                    controller: 'MainController'
                })

            // Handle the 401 error
            var unauthorizedInterceptor = ['$rootScope', '$q', '$location', function (scope, $q, $location) {
                function success(response) {
                    return response;
                }

                function error(response) {
                    var status = response.status;
                    if (status == 401) {
                        $location.path('/login').replace();
                    }
                    return $q.reject(response);
                }

                return function (promise) {
                    return promise.then(success, error);
                }
            }];
            $httpProvider.responseInterceptors.push(unauthorizedInterceptor);

            // Initialize angular-translate
            $translateProvider.useStaticFilesLoader({
                prefix: '/i18n/',
                suffix: '.json'
            });

            $translateProvider.preferredLanguage('en');

            // remember language
            $translateProvider.useCookieStorage();
        }]);
