import { Principal, StateStorageService, AuthService<% if (enableTranslation) { %>, JhiLanguageHelper<% } %> } from '../../shared';

export function registerTransitionHooks() {
    // TODO migrate to ng router or remove
    // $transitions.onStart({}, (transition: Transition) => {
    //     let $storageService = transition.injector().get(StateStorageService);
    //     $storageService.storeDestinationState(transition.to(), transition.params(), transition.from());
    //     let principal = transition.injector().get(Principal);
    //     let auth = transition.injector().get(AuthService);
    //     if (principal.isIdentityResolved()) {
    //         auth.authorize();
    //     }
    //
    //     <%_ if (enableTranslation) { _%>
    //     // Update the language //FIXME not sure if this is required, its causing some weird error as well
    //     /*let languageService = transition.injector().get(JhiLanguageService);
    //     languageService.getCurrent().then(current => {
    //         languageService.changeLanguage(current);
    //     });*/
    //     <%_ } _%>
    // });
    //
    // // Redirect to a state with an external URL (http://stackoverflow.com/a/30221248/1098564)
    // $transitions.onStart({ to: state => state['external'] }, (transition: Transition) => {
    //     window.open(transition.to().url, '_self');
    //     return false;
    // });
    //
    // $transitions.onSuccess({}, (transition: Transition) => {
    //     let toState = transition.to();
    //     let titleKey =<% if (enableTranslation) { %> 'global.title' <% }else { %> '<%= baseName %>' <% } %>;
    //
    //     // Set the page title key to the one configured in state or use default one
    //     if (toState.data.pageTitle) {
    //         titleKey = toState.data.pageTitle;
    //     }
    //     <%_ if (enableTranslation) { _%>
    //     let languageHelper = transition.injector().get(JhiLanguageHelper);
    //     languageHelper.updateTitle(titleKey);
    //     <%_ } else { _%>
    //     window.document.title = titleKey;
    //     <%_ } _%>
    // });
}
