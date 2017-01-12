import { Component } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';

@Component({
    selector: '<%=jhiPrefix%>-docs',
    templateUrl: './docs.component.html'
})
export class <%=jhiPrefixCapitalized%>DocsComponent {
    <%_ if (enableTranslation) { _%>
    constructor (private jhiLanguageService: JhiLanguageService) {
        this.jhiLanguageService.setLocations(['docs']);
    }
    <%_ } _%>
}
