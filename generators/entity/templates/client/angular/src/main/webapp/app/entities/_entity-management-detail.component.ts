<%_
var i18nToLoad = [entityInstance];
for (var idx in fields) {
    if (fields[idx].fieldIsEnum == true) {
        i18nToLoad.push(fields[idx].enumInstance);
    }
}
_%>
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
<%_ if (enableTranslation) { _%>
import { JhiLanguageService } from 'ng-jhipster';
<%_ } _%>
import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';

@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>-detail',
    templateUrl: './<%= entityFileName %>-detail.component.html'
})
export class <%= entityAngularJSName %>DetailComponent implements OnInit, OnDestroy {

    <%= entityInstance %>: <%= entityClass %>;
    private subscription: any;

    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        private <%= entityInstance %>Service: <%= entityClass %>Service,
        private route: ActivatedRoute
    ) {
        <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(<%- toArrayString(i18nToLoad) %>);
        <%_ } _%>
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            this.load(params['id']);
        });
    }

    load (id) {
        this.<%= entityInstance %>Service.find(id).subscribe(<%= entityInstance %> => {
            this.<%= entityInstance %> = <%= entityInstance %>;
        });
    }

    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
