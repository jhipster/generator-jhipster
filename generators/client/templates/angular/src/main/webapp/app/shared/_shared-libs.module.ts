import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgJhipsterModule } from 'ng-jhipster';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';
<%_ if (websocket === 'spring-websocket') { _%>
import { WindowRef } from './tracker/window.service';
<%_ } _%>

@NgModule({
    imports: [
        NgbModule.forRoot(),
        NgJhipsterModule.forRoot({
            <%_ if (enableTranslation) { _%>
            i18nEnabled: true,
            defaultI18nLang: '<%= nativeLanguage %>'
            <%_ } _%>
        }),
        InfiniteScrollModule
    ],
    <%_ if (websocket === 'spring-websocket') { _%>
    providers: [
        WindowRef
    ],
    <%_ } _%>
    exports: [
        FormsModule,
        HttpModule,
        CommonModule,
        NgbModule,
        NgJhipsterModule,
        InfiniteScrollModule
    ]
})
export class <%=angular2AppName%>SharedLibsModule {}
