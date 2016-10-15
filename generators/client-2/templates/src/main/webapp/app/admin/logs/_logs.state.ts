import { LogsComponent } from './logs.component';
<%_ if (enableTranslation) { _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";
<%_ } _%>

export const logsState = {
    name: 'logs',
    parent: 'admin',
    url: '/logs',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'logs.title'
    },
    views: {
        'content@': { component: LogsComponent }
    }<%_ if (enableTranslation) { _%>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['activate'])
    }]
    <%_ } _%>
}
