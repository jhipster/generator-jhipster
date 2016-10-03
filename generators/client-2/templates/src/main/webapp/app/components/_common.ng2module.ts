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
<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') _%>
import { AuthServerProvider } from './auth/auth-jwt.service';
<%_ } else if (authenticationType === 'oauth2') { _%>
import { AuthServerProvider } from './auth/auth-oauth2.service';
import { Base64 } from './auth/base64.service';
<%_ } else { _%>
import { AuthServerProvider } from './auth/auth-session.service';
<%_ } _%>
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
        <%_ if (authenticationType === 'oauth2') { _%>
        Base64,
        <%_ } _%>
        AuthServerProvider
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class <%=angular2AppName%>CommonModule {}
