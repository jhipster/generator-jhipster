import { <%=jhiPrefixCapitalized%>GatewayComponent } from './gateway.component';
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";

export const gatewayState = {
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
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['gateway'])
    }]
}
