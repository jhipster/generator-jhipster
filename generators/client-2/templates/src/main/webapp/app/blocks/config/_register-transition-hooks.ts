import { TransitionService, Transition } from 'ui-router-ng2';
import { Principal, AuthService<% if (enableTranslation) { %>, <%=jhiPrefixCapitalized%>LanguageService<% } %> } from '../../shared';

export function registerTransitionHooks($transitions: TransitionService) {
    $transitions.onStart({}, (transition: Transition) => {
        let $rootScope = transition.injector().get('$rootScope');
        $rootScope.toState = transition.to();
        $rootScope.toParams = transition.params();
        $rootScope.fromState = transition.from();
        let principal = transition.injector().get(Principal);
        let auth = transition.injector().get(AuthService);
        if (principal.isIdentityResolved()) {
            auth.authorize();
        }

        <% if (enableTranslation) { %>
        // Update the language //FIXME not sure if this is required, its causing some weird error as well
        /*let languageService = transition.injector().get(<%=jhiPrefixCapitalized%>LanguageService);
        languageService.getCurrent().then(current => {
            languageService.changeLanguage(current);
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
        <%_ if (enableTranslation) { _%>
        let languageService = transition.injector().get(<%=jhiPrefixCapitalized%>LanguageService);
        languageService.updateTitle(titleKey);
        <%_ } else { _%>
        window.document.title = titleKey;
        <%_ } _%>
    });
}
