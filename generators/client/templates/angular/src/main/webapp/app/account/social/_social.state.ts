import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { SocialRegisterComponent } from './social-register.component';
<%_ if (authenticationType == 'jwt') { _%>
import { SocialAuthComponent } from './social-auth.component';
<%_ } _%>

export const socialRegisterRoute: Routes= [{
    url: 'social-register/:provider?{success:boolean}',
    component: SocialRegisterComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [UserRouteAccessService]
}];

<%_ if (authenticationType == 'jwt') { _%>
export const socialAuthRoute: Routes = [{
        url: 'social-auth',
        component: SocialAuthComponent,
    data: { 
      authorities: [] 
    },
    canActivate: [UserRouteAccessService]
}]
<%_ } _%>
