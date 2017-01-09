import { Ng2StateDeclaration } from 'ui-router-ng2';
import { JhiLanguageService } from 'ng-jhipster';
import { HomeComponent } from './home.component';

export const homeState: Ng2StateDeclaration = {
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
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['home'])
    }]
};
