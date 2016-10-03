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
import { JhiAlertComponent } from './alert/alert.component';
import { JhiAlertErrorComponent } from './alert/alert-error.component';
import { HasAuthorityDirective } from './auth/has-authority.directive';
import { HasAnyAuthorityDirective } from './auth/has-any-authority.directive';

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule
    ],
    declarations: [
        JhiAlertComponent,
        JhiAlertErrorComponent,
        PageRibbonComponent,
        HasAuthorityDirective,
        HasAnyAuthorityDirective
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
    exports: [
        JhiAlertComponent,
        JhiAlertErrorComponent,
        HasAuthorityDirective,
        HasAnyAuthorityDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class <%=angular2AppName%>CommonModule {}
