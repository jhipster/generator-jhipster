import { NavbarComponent } from './layouts';
import { AuthService } from './shared';
<%_ if (enableTranslation) { _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from "./shared";
<%_ } _%>

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
        }<%_ if (enableTranslation) { _%>,
        {
            token: 'translate',
            deps: [<%=jhiPrefixCapitalized%>LanguageService],
            resolveFn: (languageService) => languageService.setLocations([])
        }
        <%_ } _%>
    ]
};
