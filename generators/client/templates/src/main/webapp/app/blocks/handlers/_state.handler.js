(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('stateHandler', stateHandler);

    stateHandler.$inject = ['$rootScope', '$state', '$localStorage', <% if (enableTranslation) { %>'$translate', '<%=jhiPrefixCapitalized%>LanguageService', 'translationHandler',<% } %> '$window',
        'Auth', 'Principal', 'ENV', 'VERSION'];

    function stateHandler($rootScope, $state, $localStorage, <% if (enableTranslation) { %>$translate, <%=jhiPrefixCapitalized%>LanguageService, translationHandler,<% } %> $window,
        Auth, Principal, ENV, VERSION) {
        return {
            initialize: initialize
        };

        function initialize() {
            $rootScope.ENV = ENV;
            $rootScope.VERSION = VERSION;
            $rootScope.back = back;

            var stateChangeStart = $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
                $rootScope.toState = toState;
                $rootScope.toStateParams = toStateParams;
                $rootScope.fromState = fromState;

                // Redirect to a state with an external URL (http://stackoverflow.com/a/30221248/1098564)
                if (toState.external) {
                    event.preventDefault();
                    $window.open(toState.url, '_self');
                }

                if (Principal.isIdentityResolved()) {
                    Auth.authorize();
                }

                <% if (enableTranslation) { %>
                // Update the language
                <%=jhiPrefixCapitalized%>LanguageService.getCurrent().then(function (language) {
                    $translate.use(language);
                });
                <% } %>
            });

            var stateChangeSuccess = $rootScope.$on('$stateChangeSuccess',  function(event, toState, toParams, fromState, fromParams) {
                var titleKey =<% if (enableTranslation) { %> 'global.title' <% }else { %> '<%= baseName %>' <% } %>;

                // Set the page title key to the one configured in state or use default one
                if (toState.data.pageTitle) {
                    titleKey = toState.data.pageTitle;
                }
                <% if (enableTranslation) { %>translationHandler.updateTitle(titleKey);<% } else { %>$window.document.title = titleKey;<% } %>
            });

            $rootScope.$on('$destroy', function () {
                if(angular.isDefined(stateChangeStart) && stateChangeStart !== null){
                    stateChangeStart();
                }
                if(angular.isDefined(stateChangeSuccess) && stateChangeSuccess !== null){
                    stateChangeSuccess();
                }
            });

            function back() {
                // If previous state is 'activate' or do not exist go to 'home'
                var previousStateName = $localStorage.previousStateName;
                var previousStateParams = $localStorage.previousStateParams;
                if (previousStateName === 'activate' || angular.isUndefined($state.get(previousStateName))) {
                    $state.go('home');
                } else {
                    $state.go(previousStateName, previousStateParams);
                }
            }
        }
    }
})();
