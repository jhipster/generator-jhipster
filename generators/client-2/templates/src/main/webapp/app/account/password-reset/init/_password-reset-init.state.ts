import {PasswordResetInitComponent} from "./password-reset-init.component";

export const requestResetState = {
    name: 'requestReset',
    parent: 'account',
    url: '/reset/request',
    data: {
        authorities: []
    },
    views: {
        'content@': { component: PasswordResetInitComponent }
    },
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('reset');
            return $translate.refresh();
        }]
    }
};
