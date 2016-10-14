import { NavbarComponent } from './layouts';
import { AuthService, <%=jhiPrefixCapitalized%>LanguageService } from './shared';

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
        },
        {
            token: 'translate',
            deps: [<%=jhiPrefixCapitalized%>LanguageService],
            resolveFn: (languageService) => languageService.setLocations(['login'])
        }
    ]
};
