(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(httpConfig)<% if (enableTranslation) { %>
        .config(translationConfig)<% } %>
        .config(localStorageConfig)
        // uncomment alertServiceConfig below to make alerts look like toast
        //.config(alertServiceConfig)
        // jhipster-needle-angularjs-add-config JHipster will add new application configuration here
        .config(urlMatcherConfig);

    httpConfig.$inject = ['$urlRouterProvider', '$httpProvider', 'httpRequestInterceptorCacheBusterProvider'];<% if (enableTranslation) { %>
    translationConfig.$inject = ['$translateProvider', 'tmhDynamicLocaleProvider'];<% } %>
    localStorageConfig.$inject = ['$localStorageProvider'];
    alertServiceConfig.$inject = ['AlertServiceProvider'];
    urlMatcherConfig.$inject = ['$urlMatcherFactoryProvider'];

    function httpConfig($urlRouterProvider, $httpProvider, httpRequestInterceptorCacheBusterProvider) {
        <% if (authenticationType == 'session') { %>
        //enable CSRF
        $httpProvider.defaults.xsrfCookieName = 'CSRF-TOKEN';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-TOKEN';
        <% } %>
        //Cache everything except rest api requests
        httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*api.*/, /.*protected.*/], true);

        $urlRouterProvider.otherwise('/');

        $httpProvider.interceptors.push('errorHandlerInterceptor');
        $httpProvider.interceptors.push('authExpiredInterceptor');<% if (authenticationType == 'oauth2' || authenticationType == 'jwt') { %>
        $httpProvider.interceptors.push('authInterceptor');<% } %>
        $httpProvider.interceptors.push('notificationInterceptor');
        // jhipster-needle-angularjs-add-interceptor JHipster will add new application http interceptor here
    }
    <% if (enableTranslation) { %>
    function translationConfig($translateProvider, tmhDynamicLocaleProvider) {
        // Initialize angular-translate
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: 'i18n/{lang}/{part}.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useCookieStorage();
        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.addInterpolation('$translateMessageFormatInterpolation');

        tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js');
        tmhDynamicLocaleProvider.useCookieStorage();
        tmhDynamicLocaleProvider.storageKey('NG_TRANSLATE_LANG_KEY');
    }
    <% } %>
    function localStorageConfig($localStorageProvider) {
        $localStorageProvider.setKeyPrefix('jhi-');
    }

    function alertServiceConfig(AlertServiceProvider) {
        AlertServiceProvider.showAsToast(true);
    }

    function urlMatcherConfig($urlMatcherFactory) {
        $urlMatcherFactory.type('boolean', {
            name : 'boolean',
            decode: function(val) { return val === true || val === 'true'; },
            encode: function(val) { return val ? 1 : 0; },
            equals: function(a, b) { return this.is(a) && a === b; },
            is: function(val) { return [true,false,0,1].indexOf(val) >= 0; },
            pattern: /bool|true|0|1/
        });
    }
})();
