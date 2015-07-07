'use strict';

angular.module('<%=angularAppName%>', ['LocalStorageModule', <% if (enableTranslation) { %>'tmh.dynamicLocale', 'pascalprecht.translate', <% } %>
               'ui.bootstrap', // for modal dialogs
    'ngResource', 'ui.router', 'ngCookies', 'ngCacheBuster', 'infinite-scroll'])

    .run(function ($rootScope, $location, $window, $http, $state, <% if (enableTranslation) { %>$translate, Language,<% } %> Auth, Principal, ENV, VERSION) {
        $rootScope.ENV = ENV;
        $rootScope.VERSION = VERSION;
        $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;

            if (Principal.isIdentityResolved()) {
                Auth.authorize();
            }
            <% if (enableTranslation) { %>
            // Update the language
            Language.getCurrent().then(function (language) {
                $translate.use(language);
            });
            <% } %>
        });

        $rootScope.$on('$stateChangeSuccess',  function(event, toState, toParams, fromState, fromParams) {
            var titleKey =<% if (enableTranslation) { %> 'global.title' <% }else { %> '<%= baseName %>' <% } %>;

            $rootScope.previousStateName = fromState.name;
            $rootScope.previousStateParams = fromParams;

            // Set the page title key to the one configured in state or use default one
            if (toState.data.pageTitle) {
                titleKey = toState.data.pageTitle;
            }
            <% if (enableTranslation) { %>
            $translate(titleKey).then(function (title) {
                // Change window title with translated one
                $window.document.title = title;
            });
            <% }else { %>$window.document.title = titleKey;<% } %>
        });

        $rootScope.back = function() {
            // If previous state is 'activate' or do not exist go to 'home'
            if ($rootScope.previousStateName === 'activate' || $state.get($rootScope.previousStateName) === null) {
                $state.go('home');
            } else {
                $state.go($rootScope.previousStateName, $rootScope.previousStateParams);
            }
        };
    })<% if (authenticationType == 'oauth2' || authenticationType == 'xauth') { %>
    .factory('authInterceptor', function ($rootScope, $q, $location, localStorageService) {
        return {
            // Add authorization token to headers
            request: function (config) {
                config.headers = config.headers || {};
                var token = localStorageService.get('token');
                <% if (authenticationType == 'oauth2') { %>
                if (token && token.expires_at && token.expires_at > new Date().getTime()) {
                    config.headers.Authorization = 'Bearer ' + token.access_token;
                }
                <% } %><% if (authenticationType == 'xauth') { %>
                if (token && token.expires && token.expires > new Date().getTime()) {
                  config.headers['x-auth-token'] = token.token;
                }
                <% } %>
                return config;
            }
        };
    })<% } %><% if (authenticationType == 'oauth2' || authenticationType == 'xauth') { %>
    .factory('authExpiredInterceptor', function ($rootScope, $q, $injector, localStorageService) {
        return {
            responseError: function (response) {
                // token has expired
                if (response.status === 401 && (response.data.error == 'invalid_token' || response.data.error == 'Unauthorized')) {
                    localStorageService.remove('token');
                    var Principal = $injector.get('Principal');
                    if (Principal.isAuthenticated()) {
                        var Auth = $injector.get('Auth');
                        Auth.authorize(true);
                    }
                }
                return $q.reject(response);
            }
        };
    })<% } %><% if (authenticationType == 'session') { %>
    .factory('authExpiredInterceptor', function ($rootScope, $q, $injector, localStorageService) {
        return {
            responseError: function(response) {
                // If we have an unauthorized request we redirect to the login page
                // Don't do this check on the account API to avoid infinite loop
                if (response.status == 401 && response.data.path !== undefined && response.data.path.indexOf("/api/account") == -1){  
                    var Auth = $injector.get('Auth');
                    var $state = $injector.get('$state');
                    var to = $rootScope.toState;
                    var params = $rootScope.toStateParams;
                    Auth.logout();
                    $rootScope.returnToState = to;
                    $rootScope.returnToStateParams = params;
                    $state.go('login');    
                }       
                return $q.reject(response);
            }
        };
    })<% } %>
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, <% if (enableTranslation) { %>$translateProvider, tmhDynamicLocaleProvider,<% } %> httpRequestInterceptorCacheBusterProvider) {
<% if (authenticationType == 'session') { %>
        //enable CSRF
        $httpProvider.defaults.xsrfCookieName = 'CSRF-TOKEN';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-TOKEN';
<% } %>
        //Cache everything except rest api requests
        httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*api.*/, /.*protected.*/], true);

        $urlRouterProvider.otherwise('/');
        $stateProvider.state('site', {
            'abstract': true,
            views: {
                'navbar@': {
                    templateUrl: 'scripts/components/navbar/navbar.html',
                    controller: 'NavbarController'
                }
            },
            resolve: {
                authorize: ['Auth',
                    function (Auth) {
                        return Auth.authorize();
                    }
                ]<% if (enableTranslation) { %>,
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('global');
                }]<% } %>
            }
        });

        $httpProvider.interceptors.push('authExpiredInterceptor');
<% if (authenticationType == 'oauth2' || authenticationType == 'xauth') { %>
        $httpProvider.interceptors.push('authInterceptor');<% } %>
        <% if (enableTranslation) { %>
        // Initialize angular-translate
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: 'i18n/{lang}/{part}.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useCookieStorage();
        $translateProvider.useSanitizeValueStrategy('escaped');

        tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js');
        tmhDynamicLocaleProvider.useCookieStorage();
        tmhDynamicLocaleProvider.storageKey('NG_TRANSLATE_LANG_KEY');
        <% } %>
    });
