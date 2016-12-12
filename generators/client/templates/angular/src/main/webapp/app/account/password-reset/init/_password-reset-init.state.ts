import {PasswordResetInitComponent} from './password-reset-init.component';
import { JhiLanguageService } from '../../../shared';

export const requestResetState = {
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
        resolveFn: (languageService) => languageService.setLocations(['reset'])
    }]
};
