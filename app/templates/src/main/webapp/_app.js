'use strict';

angular.module('<%=angularAppName%>', ['LocalStorageModule', 'tmh.dynamicLocale',
    'ngResource', 'ngRoute', 'ngCookies', 'pascalprecht.translate'])

    .run(function($rootScope, $location, $http, Auth, Role) {

        // Redirect to login if route requires auth and you're not logged in
        $rootScope.$on('$routeChangeStart', function (event, next) {
            $http.get('protected/authentication_check.gif');
            Auth.isLoggedInAsync(function(loggedIn) {
                if (next.authenticate && (!loggedIn || (next.roles != undefined && !Role.hasRole(next.roles)))) {
                    $rootScope.errorMessage = 'errors.403';
                    $location.path('/error');
                } else if ($location.path() !== "/login") {
                    var search = $location.search();
                    if (search.redirect !== undefined) {
                        $location.path(search.redirect).search('redirect', null).replace();
                    }
                }
            });
        });
    })

    .factory('authInterceptor', function ($rootScope, $q, $location, localStorageService) {
        return {<% if (authenticationType == 'token') { %>
            // Add authorization token to headers
            request: function (config) {
                config.headers = config.headers || {};
                var token = localStorageService.get('token');
                if (token && token.expires_at && token.expires_at > new Date().getTime()) {
                    config.headers.Authorization = 'Bearer ' + token.access_token;
                }
                return config;
            },<% } %>

            // Intercept 401s and redirect you to login
            responseError: function(response) {
                if(response.status === 401) {
                    // client and server logout
                    localStorageService.clearAll();
                    $rootScope.authenticated = false;
                    $rootScope.currentAccount = {};

                    if ($location.path() !== "/" && $location.path() !== "" && $location.path() !== "/register" &&
                        $location.path() !== "/activate" && $location.path() !== "/login") {
                        var redirect = $location.path();
                        $location.path('/login').search('redirect', redirect).replace();
                    }

                    return $q.reject(response);
                } else if (response.status === 403) {
                    $rootScope.errorMessage = 'errors.403';
                    $location.path('/error');
                }

                return $q.reject(response);
            }
        };
    })

    .config(function ($routeProvider, $httpProvider, $locationProvider, $translateProvider, tmhDynamicLocaleProvider) {

        $routeProvider
            .otherwise({
                redirectTo: '/#'
            });

        $httpProvider.interceptors.push('authInterceptor');

        // Initialize angular-translate
        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useCookieStorage();

        tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js');
        tmhDynamicLocaleProvider.useCookieStorage('NG_TRANSLATE_LANG_KEY');
    });
