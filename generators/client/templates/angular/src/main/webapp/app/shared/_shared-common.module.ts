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
    <%_ if (enableTranslation) { _%>
    JhiTranslate,
    JhiMissingTranslationHandler,
    JhiLanguageService,
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
    DateUtils,
    EventManager,
    JhSortDirective,
    JhSortByDirective
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
        <%_ if (enableTranslation) { _%>
        JhiTranslate,
        FindLanguageFromKeyPipe,
        <%_ } _%>
        JhiAlertComponent,
        JhiAlertErrorComponent,
        JhiItemCountComponent,
        MaxbytesValidator,
        MinbytesValidator,
        ShowValidationDirective,
        JhSortDirective,
        JhSortByDirective
    ],
    providers: [
        <%_ if (enableTranslation) { _%>
        JhiLanguageService,
        { provide: MissingTranslationHandler, useClass: JhiMissingTranslationHandler },
        <%_ } _%>
        alertServiceProvider(),
        PaginationUtil,
        ParseLinks,
        DataUtils,
        DateUtils,
        EventManager
    ],
    exports: [
        <%=angular2AppName%>SharedLibsModule,
        TruncateCharactersPipe,
        TruncateWordsPipe,
        OrderByPipe,
        FilterPipe,
        CapitalizePipe,
        KeysPipe,
        <%_ if (enableTranslation) { _%>
        JhiTranslate,
        FindLanguageFromKeyPipe,
        <%_ } _%>
        JhiAlertComponent,
        JhiAlertErrorComponent,
        JhiItemCountComponent,
        MaxbytesValidator,
        MinbytesValidator,
        ShowValidationDirective,
        JhSortDirective,
        JhSortByDirective
    ]
})
export class <%=angular2AppName%>SharedCommonModule {}
