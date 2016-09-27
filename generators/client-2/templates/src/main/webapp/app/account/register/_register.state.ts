import { RegisterComponent } from "./register.component";

export const registerState = {
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
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('register');
            return $translate.refresh();
        }]
    }
};
