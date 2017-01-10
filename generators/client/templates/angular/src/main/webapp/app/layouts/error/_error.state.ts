import { Ng2StateDeclaration } from 'ui-router-ng2';
import { JhiLanguageService } from 'ng-jhipster';
import { ErrorComponent } from './error.component';

export const errorState: Ng2StateDeclaration = {
    name: 'error',
    parent: 'app',
    url: '/error',
    data: {
        authorities: [],
        pageTitle: 'error.title'
    },
    views: {
        'content@': { component: ErrorComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['error'])
    }]
};

export const accessdeniedState: Ng2StateDeclaration = {
    name: 'accessdenied',
    parent: 'app',
    url: '/accessdenied',
    data: {
        authorities: []
    },
    views: {
        'content@': { component: ErrorComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['error'])
    }]
};
