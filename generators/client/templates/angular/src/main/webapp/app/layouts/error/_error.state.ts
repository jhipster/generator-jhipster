import { ErrorComponent } from './error.component';
import { JhiLanguageService } from '../../shared';

export const errorState = {
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
        resolveFn: (languageService) => languageService.setLocations(['error'])
    }]
};

export const accessdeniedState = {
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
        resolveFn: (languageService) => languageService.setLocations(['error'])
    }]
};
