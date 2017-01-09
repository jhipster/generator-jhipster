import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { PasswordResetInitComponent } from './password-reset-init.component';

export const requestResetState: Ng2StateDeclaration = {
    name: 'requestReset',
    parent: 'account',
    url: '/reset/request',
    data: {
        authorities: []
    },
    views: {
        'content@': { component: PasswordResetInitComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['reset'])
    }]
};
