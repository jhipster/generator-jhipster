import { SettingsComponent } from "./settings.component";

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
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('settings');
            return $translate.refresh();
        }]
    }
};
