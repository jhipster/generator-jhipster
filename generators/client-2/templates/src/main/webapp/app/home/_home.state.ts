import { HomeComponent } from './home.component';
<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from "../shared";
<% } %>

export const homeState = {
    name: 'home',
    parent: 'app',
    url: '/',
    data: {
        authorities: []
    },
    views: {
        'content@': { component: HomeComponent }
    }<% if (enableTranslation) { %>,
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['home'])
    }]<% } %>
}
