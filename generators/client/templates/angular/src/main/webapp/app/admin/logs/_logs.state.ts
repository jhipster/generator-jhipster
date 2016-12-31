import { JhiLanguageService } from 'ng-jhipster';
import { LogsComponent } from './logs.component';

export const logsState = {
    name: 'logs',
    parent: 'admin',
    url: '/logs',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'logs.title'
    },
    views: {
        'content@': { component: LogsComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['logs'])
    }]
};
