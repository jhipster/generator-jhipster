import { JhiLanguageService } from 'ng-jhipster';
import { ActivateComponent } from './activate.component';

export const activateState = {
    name: 'activate',
    parent: 'account',
    url: '/activate?key',
    data: {
        authorities: [],
        pageTitle: 'activate.title'
    },
    views: {
        'content@': { component: ActivateComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['activate'])
    }]
};
