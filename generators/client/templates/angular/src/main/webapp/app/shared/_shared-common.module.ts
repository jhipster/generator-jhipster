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
import { NgModule, Sanitizer } from '@angular/core';
import { Title } from '@angular/platform-browser';
<%_ if (enableTranslation) { _%>
import { TranslateService } from 'ng2-translate';
<%_ } _%>
import { AlertService } from 'ng-jhipster';
<%_ if (websocket === 'spring-websocket') { _%>
import { WindowRef } from './tracker/window.service';
<%_ } _%>
import {
    <%=angular2AppName%>SharedLibsModule,
    <%_ if (enableTranslation) { _%>
    JhiLanguageHelper,
    FindLanguageFromKeyPipe,
    <%_ } _%>
    <%=jhiPrefixCapitalized%>AlertComponent,
    <%=jhiPrefixCapitalized%>AlertErrorComponent
} from './';

export function alertServiceProvider(sanitizer: Sanitizer<% if (enableTranslation) { %>, translateService: TranslateService<% } %>) {
    // set below to true to make alerts look like toast
    const isToast = false;
    return new AlertService(sanitizer, isToast<% if (enableTranslation) { %>, translateService<% } %>);
}

@NgModule({
    imports: [
        <%=angular2AppName%>SharedLibsModule
    ],
    declarations: [
        <%_ if (enableTranslation) { _%>
        FindLanguageFromKeyPipe,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>AlertComponent,
        <%=jhiPrefixCapitalized%>AlertErrorComponent
    ],
    providers: [
        <%_ if (enableTranslation) { _%>
        JhiLanguageHelper,
        <%_ } _%>
        <%_ if (websocket === 'spring-websocket') { _%>
        WindowRef,
        <%_ } _%>
        {
            provide: AlertService,
            useFactory: alertServiceProvider,
            deps: [Sanitizer<% if (enableTranslation) { %>, TranslateService<% } %>]
        },
        Title
    ],
    exports: [
        <%=angular2AppName%>SharedLibsModule,
        <%_ if (enableTranslation) { _%>
        FindLanguageFromKeyPipe,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>AlertComponent,
        <%=jhiPrefixCapitalized%>AlertErrorComponent
    ]
})
export class <%=angular2AppName%>SharedCommonModule {}
