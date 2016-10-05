import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UIRouterModule } from 'ui-router-ng2';

import { <%=angular2AppName%>SharedModule } from '../shared';

import {
    jhSocial,
    Register,
    Activate,
    Password,
    PasswordResetInit,
    PasswordResetFinish,
    SocialService,
    <%_ if (authenticationType === 'session') { _%>
    SessionsService,
    SessionsComponent,
    sessionsState,
    <%_ } _%>
<% if (authenticationType == 'jwt') { %>
    SocialAuthComponent,
<% } %>
    SocialRegisterComponent,
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
    accountState,
<% if (authenticationType == 'jwt') { %>
    socialAuthState,
<% } %>
    socialRegisterState
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
    settingsState,
<% if (authenticationType == 'jwt') { %>
    socialAuthState,
<% } %>
    socialRegisterState
];

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule,
        UIRouterModule.forChild({ states: ACCOUNT_STATES })
    ],
    declarations: [
<% if (authenticationType == 'jwt') { %>
        SocialAuthComponent,
<% } %>
        SocialRegisterComponent,
        ActivateComponent,
        RegisterComponent,
        PasswordComponent,
        PasswordResetInitComponent,
        PasswordResetFinishComponent,
        <%_ if (authenticationType === 'session') { _%>
        SessionsComponent,
        <%_ } _%>
        SettingsComponent,
        jhSocial
    ],
    providers: [
        <%_ if (authenticationType === 'session') { _%>
        SessionsService,
        <%_ } _%>
        SocialService,
        Register,
        Activate,
        Password,
        PasswordResetInit,
        PasswordResetFinish
    ],
    exports: [
        jhSocial
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%=angular2AppName%>AccountModule {}
