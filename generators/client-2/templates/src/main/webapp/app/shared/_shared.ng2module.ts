import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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
    <%=jhiPrefixCapitalized%>LoginModalComponent,
<% if (enableSocialSignIn) { %>
    SocialService,
    //<%=jhiPrefixCapitalized%>SocialComponent,
<%_ } _%>
} from './';

<% if (enableSocialSignIn) { %>
    import { <%=jhiPrefixCapitalized%>SocialComponent } from './social/social.component';
<%_ } _%>


@NgModule({
    imports: [
        <%=angular2AppName%>SharedLibsModule,
        <%=angular2AppName%>SharedCommonModule
    ],
    declarations: [
<% if (enableSocialSignIn) { %>
        <%=jhiPrefixCapitalized%>SocialComponent,
<% } %>
        <%=jhiPrefixCapitalized%>LoginModalComponent,
        HasAuthorityDirective,
        HasAnyAuthorityDirective
    ],
    providers: [
        LoginService,
        LoginModalService,
        AccountService,
        StateStorageService,
        Principal,
        CSRFService,
        AuthService,
        <%_ if (authenticationType === 'oauth2') { _%>
        Base64,
        <%_ } _%>
        <%_ if (websocket === 'spring-websocket') { _%>
        <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
        AuthServerProvider,
<% if (enableSocialSignIn) { %>
        SocialService,
<% } %>
    ],
    entryComponents: [<%=jhiPrefixCapitalized%>LoginModalComponent],
    exports: [
<% if (enableSocialSignIn) { %>
        <%=jhiPrefixCapitalized%>SocialComponent,
<% } %>
        <%=angular2AppName%>SharedCommonModule,
        <%=jhiPrefixCapitalized%>LoginModalComponent,
        HasAuthorityDirective,
        HasAnyAuthorityDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class <%=angular2AppName%>SharedModule {}
