<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
import './vendor.ts';

import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Ng2Webstorage<% if (authenticationType === 'jwt') { %>, LocalStorageService, SessionStorageService <% } %> } from 'ngx-webstorage';
import { JhiEventManager } from 'ng-jhipster';

<%_ if (authenticationType === 'jwt') { _%>
import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
<%_ } _%>
import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';
import { <%=angularXAppName%>SharedModule, UserRouteAccessService } from './shared';
import { <%=angularXAppName%>AppRoutingModule} from './app-routing.module';
import { <%=angularXAppName%>HomeModule } from './home/home.module';
import { <%=angularXAppName%>AdminModule } from './admin/admin.module';
<%_ if (authenticationType !== 'oauth2') { _%>
import { <%=angularXAppName%>AccountModule } from './account/account.module';
<%_ } _%>
import { <%=angularXAppName%>EntityModule } from './entities/entity.module';
import { PaginationConfig } from './blocks/config/uib-pagination.config';
<%_ if (['session', 'oauth2'].includes(authenticationType)) { _%>
import { StateStorageService } from './shared/auth/state-storage.service';
<%_ } _%>
// jhipster-needle-angular-add-module-import JHipster will add new module here
import {
    <%=jhiPrefixCapitalized%>MainComponent,
    NavbarComponent,
    FooterComponent,
    ProfileService,
    PageRibbonComponent,
    <%_ if (enableTranslation) { _%>
    ActiveMenuDirective,
    <%_ } _%>
    ErrorComponent
} from './layouts';

@NgModule({
    imports: [
        BrowserModule,
        <%=angularXAppName%>AppRoutingModule,
        Ng2Webstorage.forRoot({ prefix: '<%=jhiPrefixDashed %>', separator: '-'}),
        <%=angularXAppName%>SharedModule,
        <%=angularXAppName%>HomeModule,
        <%=angularXAppName%>AdminModule,
        <%_ if (authenticationType !== 'oauth2') { _%>
        <%=angularXAppName%>AccountModule,
        <%_ } _%>
        <%=angularXAppName%>EntityModule,
        // jhipster-needle-angular-add-module JHipster will add new module here
    ],
    declarations: [
        <%=jhiPrefixCapitalized%>MainComponent,
        NavbarComponent,
        ErrorComponent,
        PageRibbonComponent,
        <%_ if (enableTranslation) { _%>
        ActiveMenuDirective,
        <%_ } _%>
        FooterComponent
    ],
    providers: [
        ProfileService,
        PaginationConfig,
        UserRouteAccessService,
        <%_ if (authenticationType === 'jwt') { _%>
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
            deps: [
                LocalStorageService,
                SessionStorageService
            ]
        },
        <%_ } _%>
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthExpiredInterceptor,
            multi: true,
            deps: [
                <%_ if (['session', 'oauth2'].includes(authenticationType)) { _%>
                StateStorageService,
                <%_ } _%>
                Injector
            ]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorHandlerInterceptor,
            multi: true,
            deps: [
                JhiEventManager
            ]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: NotificationInterceptor,
            multi: true,
            deps: [
                Injector
            ]
        }
    ],
    bootstrap: [ <%=jhiPrefixCapitalized%>MainComponent ]
})
export class <%=angularXAppName%>AppModule {}
