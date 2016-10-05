import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { <%=angular2AppName%>SharedModule } from '../shared';

import {
    AuthService,
    AuthServerProvider,
    <%_ if (authenticationType === 'oauth2') { _%>
    Base64,
    <%_ } _%>
    Account,
    LoginService,
    Principal,
    ProfileService,
    <%_ if (enableTranslation){ _%>
    <%=jhiPrefixCapitalized%>LanguageService,
    FindLanguageFromKeyPipe,
    <%_ } _%>
    AlertService,
    PageRibbonComponent,
    JhiAlertComponent,
    JhiAlertErrorComponent,
    HasAuthorityDirective,
    HasAnyAuthorityDirective,
    <%=jhiPrefixCapitalized%>LoginModalComponent
} from './';

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule
    ],
    declarations: [
        JhiAlertComponent,
        JhiAlertErrorComponent,
        <%=jhiPrefixCapitalized%>LoginModalComponent,
        PageRibbonComponent,
        <%_ if (enableTranslation){ _%>
        FindLanguageFromKeyPipe,
        <%_ } _%>
        HasAuthorityDirective,
        HasAnyAuthorityDirective
    ],
    providers: [
        LoginService,
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
        <%_ if (enableTranslation){ _%>
        FindLanguageFromKeyPipe,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>LoginModalComponent,
        HasAuthorityDirective,
        HasAnyAuthorityDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class <%=angular2AppName%>CommonModule {}