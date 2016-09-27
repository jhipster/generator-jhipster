import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UIRouterModule } from "ui-router-ng2";

import { <%=angular2AppName%>SharedModule } from '../shared/shared.ng2module';

<%_ if (authenticationType === 'session') { _%>
import { SessionsService } from './sessions/sessions.service';
<%_ } _%>

import { ActivateComponent } from './activate/activate.component';
import { RegisterComponent } from './register/register.component';
import { PasswordComponent } from './password/password.component';
import { PasswordResetInitComponent } from './password-reset/init/password-reset-init.component';
import { PasswordResetFinishComponent } from './password-reset/finish/password-reset-finish.component';
<%_ if (authenticationType === 'session') { _%>
import { SessionsComponent } from './sessions/sessions.component';
<%_ } _%>
import { SettingsComponent } from './settings/settings.component';

import { settingsState } from './settings/settings.state';
<%_ if (authenticationType === 'session') { _%>
import { sessionsState } from './sessions/sessions.state';
<%_ } _%>
import { activateState } from "./activate/activate.state";
import { passwordState } from "./password/password.state";
import { finishResetState } from "./password-reset/finish/password-reset-finish.state";
import { requestResetState } from "./password-reset/init/password-reset-init.state";
import { registerState } from "./register/register.state";
import { accountState } from "./account.state";



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
];

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule,
        UIRouterModule.forChild({ states: ACCOUNT_STATES })
    ],
    declarations: [
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
        SessionsService
        <%_ } _%>
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%=angular2AppName%>AccountModule {}
