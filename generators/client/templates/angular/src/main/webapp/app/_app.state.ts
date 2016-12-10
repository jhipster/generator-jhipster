import { NavbarComponent } from './layouts';
import { AuthService<% if (enableTranslation) { %>, <%=jhiPrefixCapitalized%>LanguageService<% } %> } from './shared';

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
            deps: [<%=jhiPrefixCapitalized%>LanguageService],
            resolveFn: (languageService) => languageService.setLocations([])
        }<% } %>
    ]
};
