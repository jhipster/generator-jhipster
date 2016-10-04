import { NavbarComponent } from './layouts';

export const appState = {
    name: 'app',
    abstract: true,
    views: {
        'navbar@': { component: NavbarComponent }
    },
    resolve: {
        authorize: ['Auth',
            function (Auth) {
                return Auth.authorize();
            }
        ],
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('global');
        }]
    }
};
