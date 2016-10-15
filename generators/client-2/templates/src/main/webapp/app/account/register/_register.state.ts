import { RegisterComponent } from './register.component';
<%_ if (enableTranslation) { _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";
<%_ } _%>

export const registerState = {
    name: 'register',
    parent: 'account',
    url: '/register',
    data: {
        authorities: [],
        pageTitle: 'register.title'
    },
    views: {
        'content@': { component: RegisterComponent }
    }<%_ if (enableTranslation) { _%>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['activate'])
    }]
    <%_ } _%>
};
