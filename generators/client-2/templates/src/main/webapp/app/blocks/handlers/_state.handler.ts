import { VERSION, DEBUG_INFO_ENABLED } from '../../app.constants';
import { TransitionService, Transition } from 'ui-router-ng2';

StateHandler.$inject = ['$rootScope'];
export function StateHandler($rootScope) {

    return {
        initialize: initialize
    };

    function initialize() {
        $rootScope.VERSION = VERSION;
    }
}

export function registerTransitionHooks($transitions: TransitionService) {
    $transitions.onStart({}, (transition: Transition) => {
        let $rootScope = transition.injector().get('$rootScope');
        $rootScope.toState = transition.to();
        $rootScope.toParams = transition.params();
        $rootScope.fromState = transition.from();

        /*if (Principal.isIdentityResolved()) { //TODO needs to fixed after migration
         Auth.authorize();
         }*/

        <% if (enableTranslation) { %>
            // Update the language //TODO needs to fixed after migration
            // let $translate = transition.injector().get('$translate');
            /*<%=jhiPrefixCapitalized%>LanguageService.getCurrent().then(function (language) {
             $translate.use(language);
             });*/
        <% } %>
    });

    // Redirect to a state with an external URL (http://stackoverflow.com/a/30221248/1098564)
    $transitions.onStart({ to: state => state['external'] }, (transition: Transition) => {
        window.open(transition.to().url, '_self');
        return false;
    });

    $transitions.onSuccess({}, (transition: Transition) => {
        let toState = transition.to();
        var titleKey =<% if (enableTranslation) { %> 'global.title' <% }else { %> '<%= baseName %>' <% } %>;

        // Set the page title key to the one configured in state or use default one
        if (toState.data.pageTitle) {
            titleKey = toState.data.pageTitle;
        }
        <% if (enableTranslation) { %>transition.injector().get('TranslationHandler').updateTitle(titleKey);<% } else { %>$window.document.title = titleKey;<% } %>
    });
}
