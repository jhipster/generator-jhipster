import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UIRouterModule } from 'ui-router-ng2';

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
    sessionsState,
    <%_ } _%>
    PasswordStrengthBarComponent,
    RegisterComponent,
    ActivateComponent,
    PasswordComponent,
    PasswordResetInitComponent,
    PasswordResetFinishComponent,
    SettingsComponent,
    settingsState,
    activateState,
    passwordState,
    finishResetState,
    requestResetState,
    registerState,
    <%_ if (enableSocialSignIn) { _%>
    SocialRegisterComponent,
    socialRegisterState,
    <%_ if (authenticationType == 'jwt') { _%>
    SocialAuthComponent,
    socialAuthState,
    <%_ } _%>
    <%_ } _%>
    accountState
} from './';

let ACCOUNT_STATES = [
    accountState,
    activateState,
    passwordState,
    finishResetState,
    requestResetState,
    registerState,
    <%_ if (authenticationType === 'session') { _%>
    sessionsState,
    <%_ } _%>
    <%_ if (enableSocialSignIn) { _%>
    <%_ if (authenticationType == 'jwt') { _%>
    socialAuthState,
    <%_ } _%>
    socialRegisterState,
    <%_ } _%>
    settingsState
];

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule,
        UIRouterModule.forChild({ states: ACCOUNT_STATES })
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
