import { NavbarComponent } from './layouts';
import { AuthService } from './shared';

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
        },
        {
            token: 'translatePartialLoader',
            deps: ['$translatePartialLoader'],
            resolveFn: (translatePartialLoader) => translatePartialLoader.addPart('global')
        }
    ]
};
