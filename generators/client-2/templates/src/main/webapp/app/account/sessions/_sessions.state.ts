import { SessionsComponent } from './sessions.component';
<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";
<% } %>

export const sessionsState = {
    name: 'sessions',
    parent: 'account',
    url: '/sessions',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'global.menu.account.sessions'
    },
    views: {
        'content@': { component: SessionsComponent }
    }<% if (enableTranslation) { %>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['sessions'])
    }]<% } %>
};
