import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

import {
    <%_ if (websocket === 'spring-websocket') { _%>
    <%=jhiPrefixCapitalized%>TrackerService,
    WindowRef,
    <%_ } _%>
    LoginService,
    <%_ if (authenticationType !== 'oauth2') { _%>
    LoginModalService,
    <%_ } _%>
    <%_ if (enableSocialSignIn) { _%>
    SocialService,
    <%_ } _%>
    AccountService,
    StateStorageService,
    Principal,
    CSRFService,
    AuthServerProvider,
    <%_ if (!skipUserManagement || authenticationType === 'oauth2') { _%>
    UserService,
    <%_ } _%>
    UserRouteAccessService
} from './';

@NgModule({
    imports: [],
    exports: [],
    declarations: [],
    providers: [
        <%_ if (websocket === 'spring-websocket') { _%>
        <%=jhiPrefixCapitalized%>TrackerService,
        WindowRef,
        <%_ } _%>
        LoginService,
        <%_ if (authenticationType !== 'oauth2') { _%>
        LoginModalService,
        <%_ } _%>
        <%_ if (enableSocialSignIn) { _%>
        SocialService,
        <%_ } _%>
        AccountService,
        StateStorageService,
        Principal,
        CSRFService,
        AuthServerProvider,
        <%_ if (!skipUserManagement || authenticationType === 'oauth2') { _%>
        UserService,
        <%_ } _%>
        DatePipe,
        UserRouteAccessService
    ]
})
export class <%=angularXAppName%>CoreModule {}
