import { <%=jhiPrefixCapitalized%>MetricsMonitoringComponent } from './metrics.component';
<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";
<% } %>

export const metricsState = {
    name: '<%=jhiPrefix%>-metrics',
    parent: 'admin',
    url: '/metrics',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'metrics.title'
    },
    views: {
        'content@': { component: <%=jhiPrefixCapitalized%>MetricsMonitoringComponent }
    }<% if (enableTranslation) { %>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['metrics'])
    }]<% } %>
}
