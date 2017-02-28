import { NgModule, Sanitizer } from '@angular/core';
import { Title } from '@angular/platform-browser';

<%_ if (enableTranslation) { _%>
import { TranslateService } from 'ng2-translate';
<%_ } _%>
import { AlertService } from 'ng-jhipster';

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
    let isToast = false;
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
