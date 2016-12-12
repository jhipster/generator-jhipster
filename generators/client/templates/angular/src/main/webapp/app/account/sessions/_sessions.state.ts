import { SessionsComponent } from './sessions.component';
import { JhiLanguageService } from '../../shared';

export const sessionsState = {
    name: 'sessions',
    parent: 'account',
    url: '/sessions',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'global.menu.account.sessions'
    },
    views: {
        'content@': { component: SessionsComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['sessions'])
    }]
};
