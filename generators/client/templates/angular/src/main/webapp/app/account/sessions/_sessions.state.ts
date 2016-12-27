import { JhiLanguageService } from 'ng-jhipster';
import { SessionsComponent } from './sessions.component';

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
