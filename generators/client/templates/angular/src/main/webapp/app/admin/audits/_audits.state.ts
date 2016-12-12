import { AuditsComponent } from './audits.component';
import { JhiLanguageService } from '../../shared';

export const auditState = {
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
        resolveFn: (languageService) => languageService.setLocations(['audits'])
    }]
};
