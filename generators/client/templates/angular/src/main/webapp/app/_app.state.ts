import { NavbarComponent } from './layouts';
import { AuthService<% if (enableTranslation) { %>, JhiLanguageService <% } %> } from './shared';

export const appState = {
    name: 'app',
    abstract: true,
    views: {
        'navbar@': { component: NavbarComponent }
    },
    resolve: [
        {
            token: 'authorize',
            deps: [AuthService],
            resolveFn: (auth) => auth.authorize()
        }<% if (enableTranslation) { %>,
        {
            token: 'translate',
            deps: [JhiLanguageService ],
            resolveFn: (languageService) => languageService.setLocations([])
        }<% } %>
    ]
};
