import { PasswordComponent } from './password.component';
<%_ if (enableTranslation) { _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";
<%_ } _%>

export const passwordState = {
    name: 'password',
    parent: 'account',
    url: '/password',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'global.menu.account.password'
    },
    views: {
        'content@': { component: PasswordComponent }
    }<%_ if (enableTranslation) { _%>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['activate'])
    }]
    <%_ } _%>
};
