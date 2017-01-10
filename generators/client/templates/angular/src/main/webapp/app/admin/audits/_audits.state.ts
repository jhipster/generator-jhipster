import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { AuditsComponent } from './audits.component';

export const auditState: Ng2StateDeclaration = {
    name: 'audits',
    parent: 'admin',
    url: '/audits',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'audits.title'
    },
    views: {
        'content@': { component: AuditsComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['audits'])
    }]
};
