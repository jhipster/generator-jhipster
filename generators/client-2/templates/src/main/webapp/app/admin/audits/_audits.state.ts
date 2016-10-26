import { AuditsComponent } from './audits.component';
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";

export const auditState = {
    name: 'audits',
    parent: 'admin',
    url: '/audits',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'audits.title'
    },
    views: {
        'content@': { component: AuditsComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['audits'])
    }]
}
