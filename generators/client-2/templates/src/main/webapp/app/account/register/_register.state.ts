import { RegisterComponent } from './register.component';
import { <%=jhiPrefixCapitalized%>LanguageService } from '../../shared';

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
    },
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['register'])
    }]
};
