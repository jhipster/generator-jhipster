import { NgModule } from '@angular/core';

import {
    <%=angular2AppName%>SharedLibsModule,
    <%_ if (enableTranslation) { _%>
    JhiLanguageHelper,
    FindLanguageFromKeyPipe,
    <%_ }_%>
    alertServiceProvider,
    <%=jhiPrefixCapitalized%>AlertComponent,
    <%=jhiPrefixCapitalized%>AlertErrorComponent
} from './';

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
        alertServiceProvider()
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
