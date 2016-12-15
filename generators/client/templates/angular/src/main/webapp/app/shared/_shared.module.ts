import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CookieService } from 'angular2-cookie/services/cookies.service';

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
    StateStorageService,
    LoginService,
    LoginModalService,
    Principal,
    <%_ if (websocket === 'spring-websocket') { _%>
    <%=jhiPrefixCapitalized%>TrackerService,
    <%_ } _%>
    HasAuthorityDirective,
    HasAnyAuthorityDirective,
<%_ if (enableSocialSignIn) { _%>
    <%=jhiPrefixCapitalized%>SocialComponent,
    SocialService,
<%_ } _%>
    <%=jhiPrefixCapitalized%>LoginModalComponent
} from './';

@NgModule({
    imports: [
        <%=angular2AppName%>SharedLibsModule,
        <%=angular2AppName%>SharedCommonModule
    ],
    declarations: [
        <%_ if (enableSocialSignIn) { _%>
        <%=jhiPrefixCapitalized%>SocialComponent,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>LoginModalComponent,
        HasAuthorityDirective,
        HasAnyAuthorityDirective
    ],
    providers: [
        CookieService,
        LoginService,
        LoginModalService,
        AccountService,
        StateStorageService,
        Principal,
        CSRFService,
        <%_ if (authenticationType === 'oauth2') { _%>
        Base64,
        <%_ } _%>
        <%_ if (websocket === 'spring-websocket') { _%>
        <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
        AuthServerProvider,
        <%_ if (enableSocialSignIn) { _%>
        SocialService,
        <%_ } _%>
        AuthService
    ],
    entryComponents: [<%=jhiPrefixCapitalized%>LoginModalComponent],
    exports: [
        <%=angular2AppName%>SharedCommonModule,
        <%_ if (enableSocialSignIn) { _%>
        <%=jhiPrefixCapitalized%>SocialComponent,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>LoginModalComponent,
        HasAuthorityDirective,
        HasAnyAuthorityDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class <%=angular2AppName%>SharedModule {}
