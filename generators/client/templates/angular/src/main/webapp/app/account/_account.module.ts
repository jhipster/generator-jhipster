import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { <%=angular2AppName%>SharedModule } from '../shared';

import {
    Register,
    Activate,
    Password,
    PasswordResetInit,
    PasswordResetFinish,
    <%_ if (authenticationType === 'session') { _%>
    SessionsService,
    SessionsComponent,
    <%_ } _%>
    PasswordStrengthBarComponent,
    RegisterComponent,
    ActivateComponent,
    PasswordComponent,
    PasswordResetInitComponent,
    PasswordResetFinishComponent,
    SettingsComponent,
    <%_ if (enableSocialSignIn) { _%>
    SocialRegisterComponent,
        <%_ if (authenticationType == 'jwt') { _%>
    SocialAuthComponent,
        <%_ } _%>
    <%_ } _%>
    accountState
} from './';

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule,
        RouterModule.forRoot(accountState, { useHash: true })
    ],
    declarations: [
        <%_ if (enableSocialSignIn) { _%>
        SocialRegisterComponent,
            <%_ if (authenticationType == 'jwt') { _%>
        SocialAuthComponent,
            <%_ } _%>
        <%_ } _%>
        ActivateComponent,
        RegisterComponent,
        PasswordComponent,
        PasswordStrengthBarComponent,
        PasswordResetInitComponent,
        PasswordResetFinishComponent,
        <%_ if (authenticationType === 'session') { _%>
        SessionsComponent,
        <%_ } _%>
        SettingsComponent
    ],
    providers: [
        <%_ if (authenticationType === 'session') { _%>
        SessionsService,
        <%_ } _%>
        Register,
        Activate,
        Password,
        PasswordResetInit,
        PasswordResetFinish
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%=angular2AppName%>AccountModule {}
