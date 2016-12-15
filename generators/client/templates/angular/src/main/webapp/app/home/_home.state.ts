import { HomeComponent } from './home.component';
import { JhiLanguageService } from '../shared';

export const homeState = {
    name: 'home',
    parent: 'app',
    url: '/',
    data: {
        authorities: []
    },
    views: {
        'content@': { component: HomeComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['home'])
    }]
};
