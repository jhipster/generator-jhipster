import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { LogsComponent } from './logs.component';

export const logsState: Ng2StateDeclaration = {
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
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['logs'])
    }]
};
