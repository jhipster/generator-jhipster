import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health.component';
import { <%=jhiPrefixCapitalized%>LanguageService } from '../../shared';

export const healthState = {
    name: '<%=jhiPrefix%>-health',
    parent: 'admin',
    url: '/health',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'health.title'
    },
    views: {
        'content@': { component: <%=jhiPrefixCapitalized%>HealthCheckComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['health'])
    }]
}
