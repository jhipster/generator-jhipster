import { Ng2StateDeclaration } from 'ui-router-ng2';
import { JhiLanguageService } from 'ng-jhipster';
import { <%=jhiPrefixCapitalized%>GatewayComponent } from './gateway.component';

export const gatewayState: Ng2StateDeclaration = {
    name: 'gateway',
    parent: 'admin',
    url: '/gateway',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'gateway.title'
    },
    views: {
        'content@': { component: <%=jhiPrefixCapitalized%>GatewayComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['gateway'])
    }]
}
