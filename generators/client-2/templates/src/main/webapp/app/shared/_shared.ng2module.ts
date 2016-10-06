import { NgModule } from '@angular/core';

import {
    <%=angular2AppName%>SharedLibsModule,
    <%=angular2AppName%>SharedAuthModule,
    TruncateCharactersPipe,
    TruncateWordsPipe,
    CapitalizePipe,
    FilterPipe,
    OrderByPipe,
    <%_ if (enableTranslation){ _%>
    TranslatePipe,
    <%=jhiPrefixCapitalized%>LanguageService,
    FindLanguageFromKeyPipe,
    <%_ }_%>
    <%_ if (websocket === 'spring-websocket') { _%>
    <%=jhiPrefixCapitalized%>TrackerService,
    <%_ } _%>
    KeysPipe,
    MaxbytesValidator,
    MinbytesValidator,
    ShowValidationDirective,
    JhiItemCountComponent,
    AlertService,
    JhiAlertComponent,
    JhiAlertErrorComponent
} from './';

@NgModule({
    imports: [
        <%=angular2AppName%>SharedLibsModule,
        <%=angular2AppName%>SharedAuthModule
    ],
    declarations: [
        TruncateCharactersPipe,
        TruncateWordsPipe,
        OrderByPipe,
        FilterPipe,
        CapitalizePipe,
        KeysPipe,
        <%_ if (enableTranslation){ _%>
        TranslatePipe,
        FindLanguageFromKeyPipe,
        <%_ } _%>
        JhiAlertComponent,
        JhiAlertErrorComponent,
        JhiItemCountComponent,
        MaxbytesValidator,
        MinbytesValidator,
        ShowValidationDirective
    ],
    providers: [
        <%_ if (enableTranslation){ _%>
        <%=jhiPrefixCapitalized%>LanguageService,
        <%_ } _%>
        <%_ if (websocket === 'spring-websocket') { _%>
        <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
    ],
    exports: [
        <%=angular2AppName%>SharedLibsModule,
        <%=angular2AppName%>SharedAuthModule,
        TruncateCharactersPipe,
        TruncateWordsPipe,
        OrderByPipe,
        FilterPipe,
        CapitalizePipe,
        KeysPipe,
        <%_ if (enableTranslation){ _%>
        TranslatePipe,
        FindLanguageFromKeyPipe,
        <%_ } _%>
        JhiAlertComponent,
        JhiAlertErrorComponent,
        JhiItemCountComponent,
        MaxbytesValidator,
        MinbytesValidator,
        ShowValidationDirective
    ]
})
export class <%=angular2AppName%>SharedModule {}
