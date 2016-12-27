import { JhiLanguageService } from 'ng-jhipster';
import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health.component';

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
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['health'])
    }]
};
