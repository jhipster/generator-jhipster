import { VERSION, DEBUG_INFO_ENABLED } from '../../app.constants';
import { Transition } from 'ui-router-ng2';
declare var SystemJS;

StateHandler.$inject = ['$rootScope', '$transitions', <% if (enableTranslation) { %>'$translate', /*'<%=jhiPrefixCapitalized%>LanguageService',*/ 'TranslationHandler',<% } %> '$window',
        /*'Auth', 'Principal',*/ '$uiRouter', '$trace'];

export function StateHandler($rootScope, $transitions, <% if (enableTranslation) { %>$translate, /*<%=jhiPrefixCapitalized%>LanguageService,*/ TranslationHandler,<% } %> $window,
    /*Auth, Principal,*/ $uiRouter, $trace) {

    if (DEBUG_INFO_ENABLED) {
        $trace.enable('TRANSITION');
        SystemJS.import('ui-router-visualizer').then(vis => vis.visualizer($uiRouter));
    }

    return {
        initialize: initialize
    };

    function initialize() {
        $rootScope.VERSION = VERSION;
        let deregistrationFns = [];

        deregistrationFns.push($transitions.onStart({}, (transition: Transition) => {
            $rootScope.toState = transition.to();
            $rootScope.toParams = transition.params();
            $rootScope.fromState = transition.from();

            /*if (Principal.isIdentityResolved()) { //TODO needs to fixed after migration
                Auth.authorize();
            }*/

            <% if (enableTranslation) { %>
            // Update the language //TODO needs to fixed after migration
            /*<%=jhiPrefixCapitalized%>LanguageService.getCurrent().then(function (language) {
                $translate.use(language);
            });*/
            <% } %>
        }));

        // Redirect to a state with an external URL (http://stackoverflow.com/a/30221248/1098564)
        deregistrationFns.push($transitions.onStart({ to: state => state.external }, (transition: Transition) => {
            $window.open(transition.to().url, '_self');
            return false;
        }));

        deregistrationFns.push($transitions.onSuccess({}, (transition: Transition) => {
            let toState = transition.to();
            var titleKey =<% if (enableTranslation) { %> 'global.title' <% }else { %> '<%= baseName %>' <% } %>;

            // Set the page title key to the one configured in state or use default one
            if (toState.data.pageTitle) {
                titleKey = toState.data.pageTitle;
            }
            <% if (enableTranslation) { %>TranslationHandler.updateTitle(titleKey);<% } else { %>$window.document.title = titleKey;<% } %>
        }));

        $rootScope.$on('$destroy', function () {
            deregistrationFns.forEach(deregisterFn => deregisterFn());
        });
    }
}
