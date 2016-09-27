import { SessionsComponent } from "./sessions.component";

export const sessionsState = {
    name: 'sessions',
    parent: 'account',
    url: '/sessions',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'global.menu.account.sessions'
    },
    views: {
        'content@': { component: SessionsComponent }
    },
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('sessions');
            return $translate.refresh();
        }]
    }
};
