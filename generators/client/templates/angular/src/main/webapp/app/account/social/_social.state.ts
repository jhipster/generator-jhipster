import {Routes} from '@angular/router';
import { SocialRegisterComponent } from './social-register.component';
<%_ if (authenticationType == 'jwt') { _%>
import { SocialAuthComponent } from './social-auth.component';
<%_ } _%>

export const socialRegisterRoute: Routes= [{
    url: 'social-register/:provider?{success:boolean}',
    component: SocialRegisterComponent
}];

<%_ if (authenticationType == 'jwt') { _%>
export const socialAuthRoute: Routes = [{
        url: 'social-auth',
        component: SocialAuthComponent
}]
<%_ } _%>
