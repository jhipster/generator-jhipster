import { NavbarComponent } from './layouts';

export const appState = {
    name: 'app',
    abstract: true,
    views: {
        'navbar@': { component: NavbarComponent }
    },
    resolve: [
        {
            token: 'authorize',
            deps: [AuthService],
            resolveFn: (auth) => auth.authorize()
        }/*,
        {
            token: 'translatePartialLoader',
            deps: [@Inject('$translatePartialLoader')],
            resolveFn: (translatePartialLoader) => translatePartialLoader.addPart('global')
        }*/
    ]
};
