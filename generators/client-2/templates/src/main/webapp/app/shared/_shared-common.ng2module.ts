import { NgModule } from '@angular/core';
<%_ if (enableTranslation) { _%>
import { MissingTranslationHandler } from 'ng2-translate/ng2-translate';
<%_ } _%>

import {
    <%=angular2AppName%>SharedLibsModule,
    TruncateCharactersPipe,
    TruncateWordsPipe,
    CapitalizePipe,
    FilterPipe,
    OrderByPipe,
    <%_ if (enableTranslation){ _%>
    <%=jhiPrefixCapitalized%>Translate,
    <%=jhiPrefixCapitalized%>MissingTranslationHandler,
    <%=jhiPrefixCapitalized%>LanguageService,
    FindLanguageFromKeyPipe,
    <%_ }_%>
    KeysPipe,
    MaxbytesValidator,
    MinbytesValidator,
    ShowValidationDirective,
    JhiItemCountComponent,
    alertServiceProvider,
    JhiAlertComponent,
    JhiAlertErrorComponent,
    PaginationUtil,
    ParseLinks,
    DataUtils,
    DateUtils
} from './';

@NgModule({
    imports: [
        <%=angular2AppName%>SharedLibsModule
    ],
    declarations: [
        TruncateCharactersPipe,
        TruncateWordsPipe,
        OrderByPipe,
        FilterPipe,
        CapitalizePipe,
        KeysPipe,
        <%_ if (enableTranslation){ _%>
        <%=jhiPrefixCapitalized%>Translate,
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
        { provide: MissingTranslationHandler, useClass: <%=jhiPrefixCapitalized%>MissingTranslationHandler },
        <%_ } _%>
        alertServiceProvider(),
        PaginationUtil,
        ParseLinks,
        DataUtils,
        DateUtils
    ],
    exports: [
        <%=angular2AppName%>SharedLibsModule,
        TruncateCharactersPipe,
        TruncateWordsPipe,
        OrderByPipe,
        FilterPipe,
        CapitalizePipe,
        KeysPipe,
        <%_ if (enableTranslation){ _%>
        <%=jhiPrefixCapitalized%>Translate,
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
export class <%=angular2AppName%>SharedCommonModule {}
