import { PasswordResetFinishComponent } from './password-reset-finish.component';
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../../shared";

export const finishResetState = {
    name: 'finishReset',
    parent: 'account',
    url: '/reset/finish?key',
    data: {
        authorities: []
    },
    views: {
        'content@': { component:  PasswordResetFinishComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['reset'])
    }]
};
