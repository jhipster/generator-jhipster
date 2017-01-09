import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { ActivateComponent } from './activate.component';

export const activateState: Ng2StateDeclaration = {
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
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['activate'])
    }]
};
