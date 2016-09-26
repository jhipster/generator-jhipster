import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule
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
