import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { SessionsComponent } from './sessions.component';

export const sessionsState: Ng2StateDeclaration = {
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
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['sessions'])
    }]
};
