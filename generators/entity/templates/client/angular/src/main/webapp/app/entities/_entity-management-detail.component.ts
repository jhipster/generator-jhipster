<%_
const i18nToLoad = [entityInstance];
for (const idx in fields) {
    if (fields[idx].fieldIsEnum == true) {
        i18nToLoad.push(fields[idx].enumInstance);
    }
}
_%>
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { EventManager <% if (enableTranslation) { %>, JhiLanguageService<% } %> <% if (fieldsContainBlob) { %>, DataUtils<% } %> } from 'ng-jhipster';

import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
import { <%= entityAngularName %>Service } from './<%= entityFileName %>.service';

@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>-detail',
    templateUrl: './<%= entityFileName %>-detail.component.html'
})
export class <%= entityAngularName %>DetailComponent implements OnInit, OnDestroy {

    <%= entityInstance %>: <%= entityAngularName %>;
    private subscription: any;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: EventManager,
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        <%_ if (fieldsContainBlob) { _%>
        private dataUtils: DataUtils,
        <%_ } _%>
        private <%= entityInstance %>Service: <%= entityAngularName %>Service,
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
        this.registerChangeIn<%= entityClassPlural %>();
    }

    load (id) {
        this.<%= entityInstance %>Service.find(id).subscribe(<%= entityInstance %> => {
            this.<%= entityInstance %> = <%= entityInstance %>;
        });
    }
    <%_ if (fieldsContainBlob) { _%>
    byteSize(field) {
        return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        return this.dataUtils.openFile(contentType, field);
    }
    <%_ } _%>
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeIn<%= entityClassPlural %>() {
        this.eventSubscriber = this.eventManager.subscribe('<%= entityInstance %>ListModification', response => this.load(this.<%= entityInstance %>.id));
    }

}
