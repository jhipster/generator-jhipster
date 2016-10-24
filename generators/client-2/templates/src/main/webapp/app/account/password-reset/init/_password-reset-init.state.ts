import {PasswordResetInitComponent} from './password-reset-init.component';
<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../../shared";
<% } %>

export const requestResetState = {
    name: 'requestReset',
    parent: 'account',
    url: '/reset/request',
    data: {
        authorities: []
    },
    views: {
        'content@': { component: PasswordResetInitComponent }
    }<% if (enableTranslation) { %>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['reset'])
    }]<% } %>
};
