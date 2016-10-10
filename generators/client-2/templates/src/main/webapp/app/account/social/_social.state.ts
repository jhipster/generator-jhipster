import { SocialRegisterComponent } from './social-register.component';

    export const socialRegisterState = {
            name: 'social-register',
            parent: 'account',
            url: '/social-register/:provider?{success:boolean}',
            data: {
                authorities: [],
                pageTitle: 'social.register.title'
            },
            views: {
                'content@': {
                    component: SocialRegisterComponent
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('social');
                    return $translate.refresh();
                }]
            }
        };

<% if (authenticationType == 'jwt') { %>

import { SocialAuthComponent } from './social-auth.component';

    export const socialAuthState = {
            name: 'social-auth',
            parent: 'account',
            url: '/social-auth',
            data: {
                authorities: []
            },
            views: {
                'content@': {
                    component: SocialAuthComponent
                }
            }
        };
<% } %>