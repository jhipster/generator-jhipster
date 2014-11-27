'use strict';

angular.module('<%=angularAppName%>', ['LocalStorageModule', 'tmh.dynamicLocale',
    'ngResource', 'ui.router', 'ngCookies', 'pascalprecht.translate', 'ngCacheBuster'])

    .run(function ($rootScope, $location, $http, $state, Auth, Principal) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;

            $http.get('protected/authentication_check.gif', { ignoreErrors: true })
                .error(function() {
                    if ($rootScope.toState.data.roles.length > 0) {
                        Auth.logout();
                        $state.go('login')
                    }
                });

            if (Principal.isIdentityResolved()) {
                Auth.authorize();
            }
        });

        $rootScope.$on("$stateChangeSuccess",  function(event, toState, toParams, fromState, fromParams) {
            $rootScope.previousState_name = fromState.name;
            $rootScope.previousState_params = fromParams;
        });

        $rootScope.back = function() {
            if ($rootScope.previousState_name === 'activate') {
                $state.go('home');
            } else {
                $state.go($rootScope.previousState_name,$rootScope.previousState_params);
            }
        };
    })
    <% if (authenticationType == 'token') { %>
    .factory('authInterceptor', function ($rootScope, $q, $location, localStorageService) {
        return {
            // Add authorization token to headers
            request: function (config) {
                config.headers = config.headers || {};
                var token = localStorageService.get('token');
                if (token && token.expires_at && token.expires_at > new Date().getTime()) {
                    config.headers.Authorization = 'Bearer ' + token.access_token;
                }
                return config;
            }
        };
    })
    <% } %>
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, $translateProvider, tmhDynamicLocaleProvider, httpRequestInterceptorCacheBusterProvider) {
        <% if (authenticationType == 'cookie') { %>//enable CSRF
        $httpProvider.defaults.xsrfCookieName= 'CSRF-TOKEN';
        $httpProvider.defaults.xsrfHeaderName= 'X-CSRF-TOKEN';<% } %>

        //Cache everything except rest api requests
        httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*rest.*/, /.*protected.*/], true);

        $urlRouterProvider.otherwise('/');
        $stateProvider.state('site', {
            'abstract': true,
            views: {
                'navbar@': {
                    templateUrl: 'components/navbar/navbar.html'
                }
            },
            resolve: {
                authorize: ['Auth',
                    function (Auth) {
                        return Auth.authorize();
                    }
                ]
            }
        });
        <% if (authenticationType == 'token') { %>
        $httpProvider.interceptors.push('authInterceptor');<% } %>

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
