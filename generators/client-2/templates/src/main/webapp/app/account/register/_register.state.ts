import { RegisterComponent } from './register.component';
<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from '../../shared';
<% } %>

export const registerState = {
    name: 'register',
    parent: 'account',
    url: '/register',
    data: {
        authorities: [],
        pageTitle: 'register.title'
    },
    views: {
        'content@': { component: RegisterComponent }
    }<% if (enableTranslation) { %>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['register'])
    }]<% } %>
};
