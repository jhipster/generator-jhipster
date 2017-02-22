import { NgModule } from '@angular/core';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
<%_ if (enableTranslation) { _%>
import { JhiLanguageService } from 'ng-jhipster';
import { MockLanguageService } from './helpers/mock-language.service';
<%_ } _%>

@NgModule({
    providers: [
        MockBackend,
        BaseRequestOptions,
        <%_ if (enableTranslation) { _%>
        {
            provide: JhiLanguageService,
            useClass: MockLanguageService
        },
        <%_ } _%>
        {
            provide: Http,
            useFactory: (backendInstance: MockBackend, defaultOptions: BaseRequestOptions) => {
                return new Http(backendInstance, defaultOptions);
            },
            deps: [MockBackend, BaseRequestOptions]
        }
    ]
})
export class <%=angular2AppName%>TestModule {}
