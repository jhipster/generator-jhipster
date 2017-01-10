import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { PasswordComponent } from './password.component';

export const passwordState: Ng2StateDeclaration = {
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
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['password'])
    }]
};
