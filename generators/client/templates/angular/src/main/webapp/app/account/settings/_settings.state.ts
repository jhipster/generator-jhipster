import { JhiLanguageService } from 'ng-jhipster';
import { SettingsComponent } from './settings.component';

export const settingsState = {
    name: 'settings',
    parent: 'account',
    url: '/settings',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'global.menu.account.settings'
    },
    views: {
        'content@': {
            component: SettingsComponent
        }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['settings'])
    }]
};
