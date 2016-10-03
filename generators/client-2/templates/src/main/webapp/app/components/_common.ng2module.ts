import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { <%=angular2AppName%>SharedModule } from '../shared/shared.ng2module';

import { AlertService } from './alert/alert.service';
import { ProfileService } from './profiles/profile.service';
<%_ if (enableTranslation){ _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from './language/language.service';
<%_ } _%>
import { Account } from './auth/account.service';
import { Principal } from './auth/principal.service';
import { AuthService } from './auth/auth.service';
import { AuthServerProvider } from './auth/auth-session.service';

import { PageRibbonComponent } from './profiles/page-ribbon.component';
import { jhiAlertComponent } from './alert/alert.component';

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule
    ],
    declarations: [
        jhiAlertComponent,
        PageRibbonComponent
    ],
    providers: [
        AlertService,
        ProfileService,
        <%_ if (enableTranslation){ _%>
        <%=jhiPrefixCapitalized%>LanguageService,
        <%_ } _%>
        Account,
        Principal,
        AuthService,
        AuthServerProvider
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class <%=angular2AppName%>CommonModule {}
