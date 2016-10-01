import { PasswordComponent } from './password.component';

export const passwordState = {
    name: 'password',
    parent: 'account',
    url: '/password',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'global.menu.account.password'
    },
    views: {
        'content@': { component: PasswordComponent }
    },
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('password');
            return $translate.refresh();
        }]
    }
};
