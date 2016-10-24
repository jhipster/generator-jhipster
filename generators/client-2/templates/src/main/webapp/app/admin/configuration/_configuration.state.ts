import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration.component';
<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";
<% } %>

export const configState = {
    name: '<%=jhiPrefix%>-configuration',
    parent: 'admin',
    url: '/configuration',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'configuration.title'
    },
    views: {
        'content@': { component: <%=jhiPrefixCapitalized%>ConfigurationComponent }
    }<% if (enableTranslation) { %>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['configuration'])
    }]<% } %>
}
