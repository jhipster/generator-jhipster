import { PasswordResetFinishComponent } from './password-reset-finish.component';
<%_ if (enableTranslation) { _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../../shared";
<%_ } _%>
export const finishResetState = {
    name: 'finishReset',
    parent: 'account',
    url: '/reset/finish?key',
    data: {
        authorities: []
    },
    views: {
        'content@': { component:  PasswordResetFinishComponent }
    }<%_ if (enableTranslation) { _%>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['activate'])
    }]
    <%_ } _%>
};
