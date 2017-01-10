import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration.component';

export const configState: Ng2StateDeclaration = {
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
        deps: [JhiLanguageService],
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['configuration'])
    }]
};
