'use strict';

/* App Module */

var <%= angularAppName %> = angular.module('<%= angularAppName %>', ['http-auth-interceptor', 'ngResource', 'ngRoute', 'ngCookies', 'pascalprecht.translate']);

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
                .when('/tracker', {
                    templateUrl: 'views/tracker.html',
                    controller: 'TrackerController'
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

            // Initialize angular-translate
            $translateProvider.useStaticFilesLoader({
                prefix: 'i18n/',
                suffix: '.json'
            });

            $translateProvider.preferredLanguage('en');

            // remember language
            $translateProvider.useCookieStorage();
        }])
        .run(['$rootScope', '$location', 'AuthenticationSharedService', 'Account',
            function($rootScope, $location, AuthenticationSharedService, Account) {
            $rootScope.$on("$routeChangeStart", function(event, next, current) {
                // Check if the status of the user. Is it authenticated or not?
                AuthenticationSharedService.authenticate({}, function() {
                    $rootScope.authenticated = true;
                });
            });

            // Call when the 401 response is returned by the client
            $rootScope.$on('event:auth-loginRequired', function(rejection) {
                $rootScope.authenticated = false;
                if ($location.path() !== "/" && $location.path() !== "") {
                    $location.path('/login').replace();
                }
            });

            // Call when the user is authenticated
           $rootScope.$on('event:auth-authConfirmed', function() {
               $rootScope.authenticated = true;
               $rootScope.account = Account.get();

               // If the login page has been requested and the user is already logged in
               // the user is redirected to the home page
               if ($location.path() === "/login") {
                   $location.path('/').replace();
               }
            });

            // Call when the user logs in
            $rootScope.$on('event:auth-loginConfirmed', function() {
                $rootScope.authenticated = true;
                $rootScope.account = Account.get();
                $location.path('').replace();
            });

            // Call when the user logs out
            $rootScope.$on('event:auth-loginCancelled', function() {
                $rootScope.authenticated = false;
                $location.path('');
            });
        }])
        .run(['$rootScope', '$route',
            function($rootScope, $route) {
                // This uses the Atmoshpere framework to do a Websocket connection with the server, in order to send
                // user activities each time a route changes.
                // The user activities can then be monitored by an administrator, see the views/tracker.html Angular view.

                $rootScope.websocketSocket = atmosphere;
                $rootScope.websocketSubSocket;
                $rootScope.websocketTransport = 'websocket';

                $rootScope.websocketRequest = { url: 'websocket/activity',
                    contentType : "application/json",
                    transport : $rootScope.websocketTransport ,
                    trackMessageLength : true,
                    reconnectInterval : 5000,
                    enableXDR: true,
                    timeout : 60000 };

                $rootScope.websocketRequest.onOpen = function(response) {
                    $rootScope.websocketTransport = response.transport;
                    $rootScope.websocketRequest.sendMessage();
                };

                $rootScope.websocketRequest.onClientTimeout = function(r) {
                    $rootScope.websocketRequest.sendMessage();
                    setTimeout(function (){
                        $rootScope.websocketSubSocket = $rootScope.websocketSocket.subscribe($rootScope.websocketRequest);
                    }, $rootScope.websocketRequest.reconnectInterval);
                };

                $rootScope.websocketRequest.onClose = function(response) {
                    if ($rootScope.websocketSubSocket) {
                        $rootScope.websocketRequest.sendMessage();
                    }
                };

                $rootScope.websocketRequest.sendMessage = function() {
                    if ($rootScope.websocketSubSocket.request.isOpen) {
                        $rootScope.websocketSubSocket.push(atmosphere.util.stringifyJSON({
                                userLogin: $rootScope.login,
                                page: $route.current.templateUrl}
                        ));
                    }
                };

                $rootScope.websocketSubSocket = $rootScope.websocketSocket.subscribe($rootScope.websocketRequest);

                $rootScope.$on("$routeChangeSuccess", function(event, next, current) {
                    $rootScope.websocketRequest.sendMessage();
                });
            }
        ]);
