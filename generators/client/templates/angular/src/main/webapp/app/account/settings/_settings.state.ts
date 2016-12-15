import { SettingsComponent } from './settings.component';
import { JhiLanguageService } from '../../shared';

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
