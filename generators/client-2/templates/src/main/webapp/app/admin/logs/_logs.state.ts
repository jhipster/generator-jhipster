import { LogsComponent } from './logs.component';
<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";
<% } %>

export const logsState = {
    name: 'logs',
    parent: 'admin',
    url: '/logs',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'logs.title'
    },
    views: {
        'content@': { component: LogsComponent }
    }<% if (enableTranslation) { %>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['logs'])
    }]<% } %>
}
