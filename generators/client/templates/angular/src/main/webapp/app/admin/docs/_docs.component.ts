import { Component } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';

@Component({
    selector: '<%=jhiPrefix%>-docs',
    templateUrl: './docs.component.html'
})
export class <%=jhiPrefixCapitalized%>DocsComponent {
    constructor (
        private jhiLanguageService: JhiLanguageService
    ) {
        this.jhiLanguageService.setLocations(['global']);
    }
}
