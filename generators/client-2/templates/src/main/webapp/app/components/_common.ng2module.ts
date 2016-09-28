import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { <%=angular2AppName%>SharedModule } from '../shared';

<<<<<<< 18b239d89dcae46f399d0ec5645bdcdb57c173d5
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
        BrowserModule,
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
<<<<<<< 18b239d89dcae46f399d0ec5645bdcdb57c173d5
        <%_ if (enableTranslation){ _%>
        FindLanguageFromKeyPipe,
        <%_ } _%>
=======
        <%=jhiPrefixCapitalized%>LoginModalComponent,
>>>>>>> migration of login component (home screen)
        HasAuthorityDirective,
        HasAnyAuthorityDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class <%=angular2AppName%>CommonModule {}
