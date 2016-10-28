import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration.component';
import { <%=jhiPrefixCapitalized%>LanguageService } from '../../shared';

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
    },
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['configuration'])
    }]
}
