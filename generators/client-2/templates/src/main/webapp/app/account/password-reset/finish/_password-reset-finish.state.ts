import { PasswordResetFinishComponent } from './password-reset-finish.component';
<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../../shared";
<% } %>

export const finishResetState = {
    name: 'finishReset',
    parent: 'account',
    url: '/reset/finish?key',
    data: {
        authorities: []
    },
    views: {
        'content@': { component:  PasswordResetFinishComponent }
    }<% if (enableTranslation) { %>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['reset'])
    }]<% } %>
};
