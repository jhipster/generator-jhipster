'use strict';

/* App Module */

var <%= angularAppName %> = angular.module('<%= angularAppName %>', ['http-auth-interceptor', 'tmh.dynamicLocale',
    'ngResource', 'ngRoute', 'ngCookies', 'pascalprecht.translate']);

<%= angularAppName %>
    .config(['$routeProvider', '$httpProvider', '$translateProvider',  'tmhDynamicLocaleProvider',
        function ($routeProvider, $httpProvider, $translateProvider, tmhDynamicLocaleProvider) {
            $routeProvider
                .when('/login', {
                    templateUrl: 'views/login.html',
                    controller: 'LoginController'
                })
                .when('/settings', {
                    templateUrl: 'views/settings.html',
                    controller: 'SettingsController',
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
<% if (websocket == 'atmosphere') { %>                .when('/tracker', {
                    templateUrl: 'views/tracker.html',
                    controller: 'TrackerController'
                })
<% } %>                .when('/metrics', {
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
                .when('/audits', {
                    templateUrl: 'views/audits.html',
                    controller: 'AuditsController',
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

            $translateProvider.useCookieStorage();

            tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js')
            tmhDynamicLocaleProvider.useCookieStorage('NG_TRANSLATE_LANG_KEY');
        }])
        .run(['$rootScope', '$location', 'AuthenticationSharedService', 'Account',
            function($rootScope, $location, AuthenticationSharedService, Account) {
            $rootScope.hasRole = function(role) {
                if ($rootScope.account === undefined) {
                    return false;
                }

                if ($rootScope.account.roles === undefined) {
                    return false;
                }

                if ($rootScope.account.roles[role] === undefined) {
                    return false;
                }

                return $rootScope.account.roles[role];
            };

            $rootScope.$on("$routeChangeStart", function(event, next, current) {
                // Check if the status of the user. Is it authenticated or not?
                AuthenticationSharedService.authenticate().then(function(response) {
                    if (response.data == '') {
                        $rootScope.$broadcast('event:auth-loginRequired');
                    } else {
                        $rootScope.authenticated = true;
                        $rootScope.login = response.data;
                        $rootScope.account = Account.get();

                        // If the login page has been requested and the user is already logged in
                        // the user is redirected to the home page
                        if ($location.path() === "/login") {
                            $location.path('/').replace();
                        }
                    }
                });
            });

            // Call when the 401 response is returned by the client
            $rootScope.$on('event:auth-loginRequired', function(rejection) {
                $rootScope.authenticated = false;
                if ($location.path() !== "/" && $location.path() !== "") {
                    $location.path('/login').replace();
                }
            });

            // Call when the user logs out
            $rootScope.$on('event:auth-loginCancelled', function() {
                $rootScope.login = null;
                $rootScope.authenticated = false;
                $location.path('');
            });
        }])<% if (websocket == 'atmosphere') { %>
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
        ])<% } %>;
