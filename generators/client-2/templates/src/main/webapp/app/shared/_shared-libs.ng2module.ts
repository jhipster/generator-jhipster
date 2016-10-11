import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
<%_ if (enableTranslation){ _%>
import { TranslateModule } from 'ng2-translate/ng2-translate';
import { createTranslatePartialLoader } from './language/translate-partial-loader.provider';
<%_ } _%>

@NgModule({
    imports: [
        <%_ if (enableTranslation){ _%>
        TranslateModule.forRoot(createTranslatePartialLoader()),
        <%_ } _%>
        NgbModule.forRoot()

    ],
    exports: [
        FormsModule,
        HttpModule,
        CommonModule,
        <%_ if (enableTranslation){ _%>
        TranslateModule,
        <%_ } _%>
        NgbModule
    ]
})
export class <%=angular2AppName%>SharedLibsModule {
    <%_ if (enableTranslation){ _%>
    /*static forRoot(): ModuleWithProviders {
        return {
            ngModule: Angular2TestSharedLibsModule,
            providers: [TranslateService],
        };
    }*/
    <%_ } _%>
}
