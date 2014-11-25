'use strict';

/* App Module */<% if (authenticationType == 'token') { %>
var httpHeaders;<% } %>

var <%= angularAppName %> = angular.module('<%= angularAppName %>', ['http-auth-interceptor', 'tmh.dynamicLocale',
    'ngResource', 'ngRoute', 'ngCookies', '<%= angularAppName %>Utils', 'pascalprecht.translate', 'truncate', 'ngCacheBuster']);

<%= angularAppName %>.provider('$secureRoute', function($routeProvider){
    // Register a route with access validation. It add the AuthenticationSharedService.valid promise to the resolve
    // array to ensure that upon rejection, the controller and template of the new route would not be instantiated.
    this.whenAuthenticated = function(path, route){
        var resolve = route.resolve || {};
        var isValid = ['AuthenticationSharedService', function(AuthenticationSharedService){
            return AuthenticationSharedService.valid(route.access.authorizedRoles);
        }];

        route.resolve = angular.extend(resolve, {isValid: isValid});
        return this.when(path, route);
    };

    // We add the $routeProvider methods
    this.when = $routeProvider.when;
    this.otherwise = $routeProvider.otherwise;

    // We return the route service unmodified as we only intended to change the provider.
    // We won't need to use the $secureRoute service in our application as it is the same as the $route service.
    this.$get = ['$route', function($route){ return $route; }];
});

<%= angularAppName %>
    .config(function ($secureRouteProvider, $httpProvider, $translateProvider, tmhDynamicLocaleProvider, httpRequestInterceptorCacheBusterProvider, USER_ROLES) {

            //Cache everything except rest api requests
            httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*rest.*/],true);

            $secureRouteProvider
                .whenAuthenticated('/register', {
                    templateUrl: 'views/register.html',
                    controller: 'RegisterController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .whenAuthenticated('/activate', {
                    templateUrl: 'views/activate.html',
                    controller: 'ActivationController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .whenAuthenticated('/login', {
                    templateUrl: 'views/login.html',
                    controller: 'LoginController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .whenAuthenticated('/error', {
                    templateUrl: 'views/error.html',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .whenAuthenticated('/settings', {
                    templateUrl: 'views/settings.html',
                    controller: 'SettingsController',
                    access: {
                        authorizedRoles: [USER_ROLES.user]
                    }
                })
                .whenAuthenticated('/password', {
                    templateUrl: 'views/password.html',
                    controller: 'PasswordController',
                    access: {
                        authorizedRoles: [USER_ROLES.user]
                    }
                })
                .whenAuthenticated('/sessions', {
                    templateUrl: 'views/sessions.html',
                    controller: 'SessionsController',
                    resolve:{
                        resolvedSessions:['Sessions', function (Sessions) {
                            return Sessions.get();
                        }]
                    },
                    access: {
                        authorizedRoles: [USER_ROLES.user]
                    }
                })
<% if (websocket == 'atmosphere') { %>                .whenAuthenticated('/tracker', {
                    templateUrl: 'views/tracker.html',
                    controller: 'TrackerController',
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
<% } %>                .whenAuthenticated('/metrics', {
                    templateUrl: 'views/metrics.html',
                    controller: 'MetricsController',
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
                .whenAuthenticated('/health', {
                    templateUrl: 'views/health.html',
                    controller: 'HealthController',
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
                .whenAuthenticated('/configuration', {
                    templateUrl: 'views/configuration.html',
                    controller: 'ConfigurationController',
                    resolve:{
                        resolvedConfiguration:['ConfigurationService', function (ConfigurationService) {
                            return ConfigurationService.get();
                        }]
                    },
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
                .whenAuthenticated('/logs', {
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
                .whenAuthenticated('/audits', {
                    templateUrl: 'views/audits.html',
                    controller: 'AuditsController',
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
                .whenAuthenticated('/logout', {
                    templateUrl: 'views/main.html',
                    controller: 'LogoutController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .whenAuthenticated('/docs', {
                    templateUrl: 'views/docs.html',
                    access: {
                        authorizedRoles: [USER_ROLES.admin]
                    }
                })
                .whenAuthenticated('/', {
                    templateUrl: 'views/main.html',
                    controller: 'MainController',
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                .otherwise({
                    redirectTo: '/'
                });

            // Initialize angular-translate
            $translateProvider.useStaticFilesLoader({
                prefix: 'i18n/',
                suffix: '.json'
            });

            $translateProvider.preferredLanguage('en');

            $translateProvider.useCookieStorage();

            tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js')
            tmhDynamicLocaleProvider.useCookieStorage('NG_TRANSLATE_LANG_KEY');<% if (authenticationType == 'token') { %>
            httpHeaders = $httpProvider.defaults.headers;<% } %>
        })
        .run(function($rootScope, $location, $http, AuthenticationSharedService, Session, USER_ROLES) {
                $rootScope.authenticated = false;
                $rootScope.$on('$routeChangeStart', function (event, next) {
                    $rootScope.isAuthorized = AuthenticationSharedService.isAuthorized;
                    $rootScope.userRoles = USER_ROLES;
                });

                // Call when the the client is confirmed
                $rootScope.$on('event:auth-loginConfirmed', function(data) {
                    $rootScope.authenticated = true;
                    if ($location.path() === "/login") {
                        var search = $location.search();
                        if (search.redirect !== undefined) {
                            $location.path(search.redirect).search('redirect', null).replace();
                        } else {
                            $location.path('/').replace();
                        }
                    }
                });

                // Call when the 401 response is returned by the server
                $rootScope.$on('event:auth-loginRequired', function(rejection) {
                    Session.invalidate();
                    $rootScope.authenticated = false;
                    if ($location.path() !== "/" && $location.path() !== "" && $location.path() !== "/register" &&
                            $location.path() !== "/activate" && $location.path() !== "/login") {
                        var redirect = $location.path();
                        $location.path('/login').search('redirect', redirect).replace();
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
        })<% if (websocket == 'atmosphere') { %>
        .run(function($rootScope, $route) {
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

                $rootScope.websocketRequest.sendMessage = function () {
                    if ($rootScope.websocketSubSocket.request.isOpen) {
                        if ($rootScope.account != null) {
                            $rootScope.websocketSubSocket.push(atmosphere.util.stringifyJSON({
                                userLogin: $rootScope.account.login,
                                page: $route.current.templateUrl})
                            );
                        }
                    }
                }

                $rootScope.websocketSubSocket = $rootScope.websocketSocket.subscribe($rootScope.websocketRequest);

                $rootScope.$on("$routeChangeSuccess", function(event, next, current) {
                    $rootScope.websocketRequest.sendMessage();
                });
            }
        )<% } %>;
