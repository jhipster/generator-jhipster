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
        private jhiLanguageService: JhiLanguageService
    ) {
        this.jhiLanguageService.setLocations(['error']);
    }

    ngOnInit() {
        <%_ // TODO need to see how the error message can be passed here _%>
    }
}
