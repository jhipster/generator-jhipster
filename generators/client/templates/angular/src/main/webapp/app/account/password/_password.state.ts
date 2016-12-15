import { PasswordComponent } from './password.component';
import { JhiLanguageService } from '../../shared';

export const passwordState = {
    name: 'password',
    parent: 'account',
    url: '/password',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'global.menu.account.password'
    },
    views: {
        'content@': { component: PasswordComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['password'])
    }]
};
