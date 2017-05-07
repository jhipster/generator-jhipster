<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CookieService } from 'angular2-cookie/services/cookies.service';
import {
    <%=angular2AppName%>SharedLibsModule,
    <%=angular2AppName%>SharedCommonModule,
    CSRFService,
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
