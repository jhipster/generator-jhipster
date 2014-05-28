'use strict';

/* App Module */<% if (authenticationType == 'token') { %>
var httpHeaders;<% } %>

var <%= angularAppName %> = angular.module('<%= angularAppName %>', ['http-auth-interceptor', 'tmh.dynamicLocale',
    'ngRoute', 'ngCookies', '<%= angularAppName %>Utils', 'pascalprecht.translate', 'truncate', 'restangular']);

<%= angularAppName %>
    .config(['$routeProvider', '$httpProvider', '$translateProvider',  'tmhDynamicLocaleProvider', 'USER_ROLES',
        function ($routeProvider, $httpProvider, $translateProvider, tmhDynamicLocaleProvider, USER_ROLES) {
            $routeProvider
                .when('/register', {
                    templateUrl: 'views/register.html',
                    controller: 'RegisterController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .when('/activate', {
                    templateUrl: 'views/activate.html',
                    controller: 'ActivationController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .when('/login', {
                    templateUrl: 'views/login.html',
                    controller: 'LoginController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .when('/error', {
                    templateUrl: 'views/error.html',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .when('/settings', {
                    templateUrl: 'views/settings.html',
                    controller: 'SettingsController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .when('/password', {
                    templateUrl: 'views/password.html',
                    controller: 'PasswordController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .when('/sessions', {
                    templateUrl: 'views/sessions.html',
                    controller: 'SessionsController',
                    resolve:{
                        resolvedSessions:['Sessions', function (Sessions) {
                            return Sessions.getAll();
                        }]
                    },
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
<% if (websocket == 'atmosphere') { %>                .when('/tracker', {
                    templateUrl: 'views/tracker.html',
                    controller: 'TrackerController',
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
<% } %>                .when('/metrics', {
                    templateUrl: 'views/metrics.html',
                    controller: 'MetricsController',
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
                .when('/logs', {
                    templateUrl: 'views/logs.html',
                    controller: 'LogsController',
                    resolve:{
                        resolvedLogs:['LogsService', function (LogsService) {
                            return LogsService.findAll();
                        }]
                    },
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
                .when('/audits', {
                    templateUrl: 'views/audits.html',
                    controller: 'AuditsController',
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
                .when('/logout', {
                    templateUrl: 'views/main.html',
                    controller: 'LogoutController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .when('/docs', {
                    templateUrl: 'views/docs.html',
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
                .otherwise({
                    templateUrl: 'views/main.html',
                    controller: 'MainController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                });

            // Initialize angular-translate
            $translateProvider.useStaticFilesLoader({
                prefix: 'i18n/',
                suffix: '.json'
            });

            $translateProvider.preferredLanguage('en');

            $translateProvider.useCookieStorage();

            tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js')
            tmhDynamicLocaleProvider.useCookieStorage('NG_TRANSLATE_LANG_KEY');
            <% if (authenticationType == 'token') { %>
            httpHeaders = $httpProvider.defaults.headers;<% } %>
        }])
        .run(['$rootScope', '$location', '$http', 'AuthenticationSharedService', 'Session', 'USER_ROLES',
            function($rootScope, $location, $http, AuthenticationSharedService, Session, USER_ROLES) {
                $rootScope.$on('$routeChangeStart', function (event, next) {
                    $rootScope.isAuthorized = AuthenticationSharedService.isAuthorized;
                    $rootScope.userRoles = USER_ROLES;
                    AuthenticationSharedService.valid(next.access.authorizedRoles);
                });

                // Call when the the client is confirmed
                $rootScope.$on('event:auth-loginConfirmed', function(data) {
                    $rootScope.authenticated = true;
                    if ($location.path() === "/login") {
                        $location.path('/').replace();
                    }
                });

                // Call when the 401 response is returned by the server
                $rootScope.$on('event:auth-loginRequired', function(rejection) {
                    Session.invalidate();
                    $rootScope.authenticated = false;
                    if ($location.path() !== "/" && $location.path() !== "" && $location.path() !== "/register" &&
                            $location.path() !== "/activate") {
                        $location.path('/login').replace();
                    }
                });

                // Call when the 403 response is returned by the server
                $rootScope.$on('event:auth-notAuthorized', function(rejection) {
                    $rootScope.errorMessage = 'errors.403';
                    $location.path('/error').replace();
                });

                // Call when the user logs out
                $rootScope.$on('event:auth-loginCancelled', function() {
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
