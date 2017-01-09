import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { <%=jhiPrefixCapitalized%>MetricsMonitoringComponent } from './metrics.component';

export const metricsState: Ng2StateDeclaration = {
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
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['metrics'])
    }]
};
