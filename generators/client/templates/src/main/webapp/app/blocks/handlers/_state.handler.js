(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('stateHandler', stateHandler);

    stateHandler.$inject = ['$rootScope', '$state', '$sessionStorage', <% if (enableTranslation) { %>'$translate', '<%=jhiPrefixCapitalized%>LanguageService', 'translationHandler',<% } %> '$window',
        'Auth', 'Principal', 'VERSION'];

    function stateHandler($rootScope, $state, $sessionStorage, <% if (enableTranslation) { %>$translate, <%=jhiPrefixCapitalized%>LanguageService, translationHandler,<% } %> $window,
        Auth, Principal, VERSION) {
        return {
            initialize: initialize
        };

        function initialize() {
            $rootScope.VERSION = VERSION;

            var stateChangeStart = $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams, fromState) {
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
        }
    }
})();
