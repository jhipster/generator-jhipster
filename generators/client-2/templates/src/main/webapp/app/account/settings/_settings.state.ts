import { SettingsComponent } from './settings.component';
<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../../shared";
<% } %>

export const settingsState = {
    name: 'settings',
    parent: 'account',
    url: '/settings',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'global.menu.account.settings'
    },
    views: {
        'content@': {
            component: SettingsComponent
        }
    }<% if (enableTranslation) { %>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['settings'])
    }]<% } %>
};
