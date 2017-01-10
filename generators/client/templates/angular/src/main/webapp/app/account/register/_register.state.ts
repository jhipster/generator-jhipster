import { Ng2StateDeclaration } from "ui-router-ng2";
import { JhiLanguageService } from 'ng-jhipster';
import { RegisterComponent } from './register.component';

export const registerState: Ng2StateDeclaration = {
    name: 'register',
    parent: 'account',
    url: '/register',
    data: {
        authorities: [],
        pageTitle: 'register.title'
    },
    views: {
        'content@': { component: RegisterComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['register'])
    }]
};
