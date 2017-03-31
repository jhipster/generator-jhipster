import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CookieService } from 'angular2-cookie/services/cookies.service';
import {
    <%=angular2AppName%>SharedLibsModule,
    <%=angular2AppName%>SharedCommonModule,
    CSRFService,
    AuthService,
    <%_ if (!skipServer) { _%>
    AuthServerProvider,
    <%_ } _%>
    AccountService,
    <%_ if (!skipUserManagement) { _%>
    UserService,
    <%_ } _%>
    StateStorageService,
    LoginService,
    LoginModalService,
    Principal,
    <%_ if (websocket === 'spring-websocket') { _%>
    <%=jhiPrefixCapitalized%>TrackerService,
    <%_ } _%>
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
        <%_ if (websocket === 'spring-websocket') { _%>
        <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
        <%_ if (!skipServer) { _%>
        AuthServerProvider,
        <%_ } _%>
        <%_ if (enableSocialSignIn) { _%>
        SocialService,
        <%_ } _%>
        AuthService,
        <%_ if (!skipUserManagement) { _%>
        UserService,
        <%_ } _%>
        DatePipe
    ],
    entryComponents: [<%=jhiPrefixCapitalized%>LoginModalComponent],
    exports: [
        <%=angular2AppName%>SharedCommonModule,
        <%_ if (enableSocialSignIn) { _%>
        <%=jhiPrefixCapitalized%>SocialComponent,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>LoginModalComponent,
        HasAnyAuthorityDirective,
        DatePipe
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class <%=angular2AppName%>SharedModule {}
