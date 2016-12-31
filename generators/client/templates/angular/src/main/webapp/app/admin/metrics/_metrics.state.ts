import { JhiLanguageService } from 'ng-jhipster';
import { <%=jhiPrefixCapitalized%>MetricsMonitoringComponent } from './metrics.component';

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
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['metrics'])
    }]
};
