import { Component, OnInit } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';

@Component({
    selector: '<%=jhiPrefix%>-error',
    templateUrl: './error.component.html'
})
export class ErrorComponent implements OnInit {
    errorMessage: string;
    error403: boolean;

    constructor(
    	<%_ if (enableTranslation) { _%>
        private languageService: JhiLanguageService
        <%_ } _%>
    ) {
    	<%_ if (enableTranslation) { _%>
        this.languageService.setLocations(['error']);
        <%_ } _%>
    }

    ngOnInit() {
        // TODO need to see how the error message can be passed here
    }
}
