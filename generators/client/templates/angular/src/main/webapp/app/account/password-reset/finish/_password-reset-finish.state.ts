import { PasswordResetFinishComponent } from './password-reset-finish.component';
import { JhiLanguageService } from '../../../shared';

export const finishResetState = {
    name: 'finishReset',
    parent: 'account',
    url: '/reset/finish?key',
    data: {
        authorities: []
    },
    views: {
        'content@': { component:  PasswordResetFinishComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['reset'])
    }]
};
