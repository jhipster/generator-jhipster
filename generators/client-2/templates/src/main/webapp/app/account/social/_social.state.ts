import { SocialRegisterComponent } from './social-register.component';
import { JhiLanguageService } from "../../shared";

export const socialRegisterState = {
    name: 'social-register',
    parent: 'account',
    url: '/social-register/:provider?{success:boolean}',
    data: {
        authorities: [],
        pageTitle: 'social.register.title'
    },
    views: {
        'content@': {
            component: SocialRegisterComponent
        }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['social'])
    }]
};

<% if (authenticationType == 'jwt') { %>

import { SocialAuthComponent } from './social-auth.component';

export const socialAuthState = {
    name: 'social-auth',
    parent: 'account',
    url: '/social-auth',
    data: {
        authorities: []
    },
    views: {
        'content@': {
            component: SocialAuthComponent
        }
    }
};
<% } %>