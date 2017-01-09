import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { <%=jhiPrefixCapitalized%>HealthCheckComponent } from './health.component';

export const healthState: Ng2StateDeclaration = {
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
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['health'])
    }]
};
