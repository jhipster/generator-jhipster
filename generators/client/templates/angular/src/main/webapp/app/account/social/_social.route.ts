import { Route } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { SocialRegisterComponent } from './social-register.component';
<%_ if (authenticationType == 'jwt') { _%>
import { SocialAuthComponent } from './social-auth.component';
<%_ } _%>

export const socialRegisterRoute: Route = {
    path: 'social-register/:provider?{success:boolean}',
    component: SocialRegisterComponent,
    data: {
        authorities: [],
        pageTitle: 'social.register.title'
    },
    canActivate: [UserRouteAccessService]
};

<%_ if (authenticationType == 'jwt') { _%>
export const socialAuthRoute: Route = {
    path: 'social-auth',
    component: SocialAuthComponent,
    data: {
        authorities: [],
        pageTitle: 'social.register.title'
    },
    canActivate: [UserRouteAccessService]
};
<%_ } _%>
