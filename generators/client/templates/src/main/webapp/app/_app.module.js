(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>', [
            'ngStorage', <% if (enableTranslation) { %>
            'tmh.dynamicLocale',
            'pascalprecht.translate', <% } %>
            'ngResource',
            'ngCookies',
            'ngAria',
            'ngCacheBuster',
            'ngFileUpload',
            'ui.bootstrap',
            'ui.bootstrap.datetimepicker',
            'ui.router',
            'infinite-scroll',
            // jhipster-needle-angularjs-add-module JHipster will add new module here
            'angular-loading-bar'
        ])
        .run(run);

    run.$inject = ['$rootScope', '$location', '$window', '$http', '$state', <% if (enableTranslation) { %>'$translate', 'Language',<% } %>
        'Auth', 'Principal', 'ENV', 'VERSION'];

    function run($rootScope, $location, $window, $http, $state, <% if (enableTranslation) { %>$translate, Language,<% } %>
        Auth, Principal, ENV, VERSION) {
        <% if (enableTranslation) { %>// update the window title using params in the following
        // precendence
        // 1. titleKey parameter
        // 2. $state.$current.data.pageTitle (current state page title)
        // 3. 'global.title'
        var updateTitle = function(titleKey) {
            if (!titleKey && $state.$current.data && $state.$current.data.pageTitle) {
                titleKey = $state.$current.data.pageTitle;
            }
            $translate(titleKey || 'global.title').then(function (title) {
                $window.document.title = title;
            });
        };
        <%}%>
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

            // Remember previous state unless we've been redirected to login or we've just
            // reset the state memory after logout. If we're redirected to login, our
            // previousState is already set in the authExpiredInterceptor. If we're going
            // to login directly, we don't want to be sent to some previous state anyway
            if (!$rootScope.redirected && $rootScope.previousStateName) {
              $rootScope.previousStateName = fromState.name;
              $rootScope.previousStateParams = fromParams;
            }

            // Set the page title key to the one configured in state or use default one
            if (toState.data.pageTitle) {
                titleKey = toState.data.pageTitle;
            }
            <% if (enableTranslation) { %>updateTitle(titleKey);<% } else { %>$window.document.title = titleKey;<% } %>
        });
        <% if (enableTranslation) { %>
        // if the current translation changes, update the window title
        $rootScope.$on('$translateChangeSuccess', function() { updateTitle(); });

        <% } %>
        $rootScope.back = function() {
            // If previous state is 'activate' or do not exist go to 'home'
            if ($rootScope.previousStateName === 'activate' || $state.get($rootScope.previousStateName) === null) {
                $state.go('home');
            } else {
                $state.go($rootScope.previousStateName, $rootScope.previousStateParams);
            }
        };
    }
})();
