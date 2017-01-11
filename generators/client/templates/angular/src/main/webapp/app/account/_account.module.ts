import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {RouterModule} from '@angular/router';

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
    PasswordResolve,
    SessionsResolve,
    SettingsResolve,
    settingsRoute,
    activateRoute,
    passwordRoute,
    finishResetRoute,
    requestResetRoute,
    registerRoute,
    <%_ if (enableSocialSignIn) { _%>
    SocialRegisterComponent,
    socialRegisterRoute,
        <%_ if (authenticationType == 'jwt') { _%>
    SocialAuthComponent,
    socialAuthRoute,
        <%_ } _%>
    <%_ } _%>
    accountState
} from './';

let ACCOUNT_ROUTES = [
   ...activateRoute,
   ...passwordRoute,
   ...finishResetRoute,
   ...requestResetRoute,
   ...registerRoute,
    <%_ if (authenticationType === 'session') { _%>
   ...sessionsRoute,
    <%_ } _%>
    <%_ if (enableSocialSignIn) { _%>
        <%_ if (authenticationType == 'jwt') { _%>
    ...socialAuthRoute,
        <%_ } _%>
   ...socialRegisterRoute,
    <%_ } _%>
   ...settingsRoute
];

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule,
        RouterModule.forRoot(ACCOUNT_ROUTES, { useHash: true })
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
        PasswordResetFinish,
        PasswordResolve,
        SessionsResolve,
        SettingsResolve
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%=angular2AppName%>AccountModule {}
