import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgJhipsterModule } from 'ng-jhipster';

@NgModule({
    imports: [
        NgbModule.forRoot(),
        NgJhipsterModule.forRoot({
            <%_ if (enableTranslation) { _%>
            i18nEnabled: true,
            defaultI18nLang: '<%= nativeLanguage %>'
            <%_ } _%>
        })
    ],
    exports: [
        FormsModule,
        HttpModule,
        CommonModule,
        NgbModule,
        NgJhipsterModule
    ]
})
export class <%=angular2AppName%>SharedLibsModule {}
