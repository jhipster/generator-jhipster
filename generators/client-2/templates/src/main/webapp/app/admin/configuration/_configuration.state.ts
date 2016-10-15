import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration.component';
<%_ if (enableTranslation) { _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";
<%_ } _%>

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
    }<%_ if (enableTranslation) { _%>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['activate'])
    }]
    <%_ } _%>
}
