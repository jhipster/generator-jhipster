import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

<%_ if (enableTranslation){ _%>
import { TranslateModule, TranslateLoader, TranslateStaticLoader, TranslateService,MissingTranslationHandler } from 'ng2-translate/ng2-translate';
import { <%=jhiPrefixCapitalized%>MissingTranslationHandler} from './language/<%=jhiPrefix%>Missing.translation';
<%_ } _%>

import {<%=jhiPrefix%>-translate} from './directive/<%=jhiPrefix%>-translate';

import {
    <%=angular2AppName%>SharedLibsModule,
    <%=angular2AppName%>SharedCommonModule,
    CSRFService,
    AuthService,
    AuthServerProvider,
    <%_ if (authenticationType === 'oauth2') { _%>
    Base64,
    <%_ } _%>
    AccountService,
    LoginService,
    Principal,
    <%_ if (websocket === 'spring-websocket') { _%>
    <%=jhiPrefixCapitalized%>TrackerService,
    <%_ } _%>
    HasAuthorityDirective,
    HasAnyAuthorityDirective,
    <%=jhiPrefixCapitalized%>LoginModalComponent
} from './';

@NgModule({
    imports: [
        <%=angular2AppName%>SharedLibsModule,
        <%=angular2AppName%>SharedCommonModule<%_ if (enableTranslation){ _%>,
        TranslateModule.forRoot({
          provide: TranslateLoader,
          useFactory: (http: Http) => new TranslateStaticLoader(http, '/i18n', '.json'),
          deps: [Http]
        })
        <%_ } _%>
    ],
    declarations: [
        <%=jhiPrefixCapitalized%>LoginModalComponent,
        HasAuthorityDirective,
        HasAnyAuthorityDirective,
        <%=jhiPrefix%>-translate
    ],
    providers: [
        LoginService,
        AccountService,
        Principal,
        CSRFService,
        AuthService,
        <%_ if (authenticationType === 'oauth2') { _%>
        Base64,
        <%_ } _%>
        <%_ if (websocket === 'spring-websocket') { _%>
        <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
        AuthServerProvider<%_ if (enableTranslation){ _%>,
        { provide: MissingTranslationHandler, useClass: CustomMissingTranslationHandler }
        <%_ } _%>
    ],
    exports: [
        <%=angular2AppName%>SharedCommonModule,
        <%=jhiPrefixCapitalized%>LoginModalComponent,
        HasAuthorityDirective,
        HasAnyAuthorityDirective,
        <%=jhiPrefix%>-translate
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class <%=angular2AppName%>SharedModule {
    <%_ if (enableTranslation){ _%>
     static forRoot(): ModuleWithProviders {
        return {
            ngModule: TranslateSharedModule,
            providers: [TranslateService],
        };
    }
    <%_ } _%>
}
