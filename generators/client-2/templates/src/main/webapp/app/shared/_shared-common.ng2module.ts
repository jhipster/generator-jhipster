import { NgModule } from '@angular/core';

import {
    <%=angular2AppName%>SharedLibsModule,
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
    KeysPipe,
    MaxbytesValidator,
    MinbytesValidator,
    ShowValidationDirective,
    JhiItemCountComponent,
    alertServiceProvider,
    JhiAlertComponent,
    JhiAlertErrorComponent
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
        alertServiceProvider()
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
export class <%=angular2AppName%>SharedCommonModule {}
