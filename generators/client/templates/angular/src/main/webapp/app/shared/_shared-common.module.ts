<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
import { NgModule, LOCALE_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';

<%_ if (websocket === 'spring-websocket') { _%>
import { WindowRef } from './tracker/window.service';
<%_ } _%>
import {
    <%=angularXAppName%>SharedLibsModule,
    <%_ if (enableTranslation) { _%>
    JhiLanguageHelper,
    FindLanguageFromKeyPipe,
    <%_ } _%>
    <%=jhiPrefixCapitalized%>AlertComponent,
    <%=jhiPrefixCapitalized%>AlertErrorComponent
} from './';

@NgModule({
    imports: [
        <%=angularXAppName%>SharedLibsModule
    ],
    declarations: [
        <%_ if (enableTranslation) { _%>
        FindLanguageFromKeyPipe,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>AlertComponent,
        <%=jhiPrefixCapitalized%>AlertErrorComponent
    ],
    providers: [
        <%_ if (enableI18nRTL) { _%>
        FindLanguageFromKeyPipe,
        <%_ } if (enableTranslation) { _%>
        JhiLanguageHelper,
        <%_ } if (websocket === 'spring-websocket') { _%>
        WindowRef,
        <%_ } _%>
        Title,
        {
            provide: LOCALE_ID,
        <%_ if (skipLanguageForLocale(nativeLanguage)) { _%>
            useValue: 'en'
        <%_ } else { _%>
            useValue: '<%= nativeLanguage %>'
        <%_ } _%>
        },
    ],
    exports: [
        <%=angularXAppName%>SharedLibsModule,
        <%_ if (enableTranslation) { _%>
        FindLanguageFromKeyPipe,
        <%_ } _%>
        <%=jhiPrefixCapitalized%>AlertComponent,
        <%=jhiPrefixCapitalized%>AlertErrorComponent
    ]
})
export class <%=angularXAppName%>SharedCommonModule {}
