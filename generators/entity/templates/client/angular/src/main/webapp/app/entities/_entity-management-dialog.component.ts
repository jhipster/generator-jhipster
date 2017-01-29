<%_
var i18nToLoad = [entityInstance];
for (var idx in fields) {
    if (fields[idx].fieldIsEnum == true) {
        i18nToLoad.push(fields[idx].enumInstance);
    }
}
_%>
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Response } from '@angular/http';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, AlertService<% if (enableTranslation) { %>, JhiLanguageService<% } %> } from 'ng-jhipster';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>PopupService } from './<%= entityFileName %>-popup.service';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';
<%_ for (var rel of differentRelationships) { _%> 
import { <%= rel.otherEntityNameCapitalized %>, <%= rel.otherEntityNameCapitalized %>Service } from '../../<%= rel.otherEntityModulePath %>';
<%_ } _%>
// TODO replace ng-file-upload dependency by an ng2 depedency
// TODO Find a better way to format dates so that it works with NgbDatePicker
@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>-dialog',
    templateUrl: './<%= entityFileName %>-dialog.component.html'
})
export class <%= entityAngularJSName %>DialogComponent implements OnInit {

    <%= entityInstance %>: <%= entityClass %>;
    authorities: any[];
    isSaving: boolean;
    <%_
    var queries = [];
    var variables = [];
    var hasManyToMany = false;
    for (idx in relationships) {
        var query;
        var variableName;
        hasManyToMany = hasManyToMany || relationships[idx].relationshipType == 'many-to-many';
        if (relationships[idx].relationshipType == 'one-to-one' && relationships[idx].ownerSide == true && relationships[idx].otherEntityName != 'user') {
            variableName = relationships[idx].relationshipFieldNamePlural.toLowerCase();
            var relationshipFieldName = "this." + entityInstance + "." + relationships[idx].relationshipFieldName;
            query  = "this." + relationships[idx].otherEntityName + "Service.query({filter: '" + relationships[idx].otherEntityRelationshipName.toLowerCase() + "-is-null'}).subscribe((res: Response) => {"
            if (dto === "no") {
                query += "\n            if (!" + relationshipFieldName + " || !" + relationshipFieldName + ".id) {"
            } else {
                query += "\n            if (!" + relationshipFieldName + "Id) {"
            }
            query += "\n                this." + variableName + " = res.json();"
            query += "\n            } else {"
            query += "\n                this." + relationships[idx].otherEntityName + "Service.find(" + relationshipFieldName + (dto == 'no' ? ".id" : "Id") + ").subscribe((subRes: Response) => {"
            query += "\n                    this." + variableName + " = [subRes].concat(res.json());"
            query += "\n                }, (subRes: Response) => this.onError(subRes.json()));"
            query += "\n            }"
            query += "\n        }, (res: Response) => this.onError(res.json()));"
        } else {
            variableName = relationships[idx].otherEntityNameCapitalizedPlural.toLowerCase();
            query = 'this.' + relationships[idx].otherEntityName + 'Service.query().subscribe(';
            query += '\n            (res: Response) => { this.' + variableName + ' = res.json(); }, (res: Response) => this.onError(res.json()));';
        }
        if (!contains(queries, query)) {
            queries.push(query);
            variables.push(variableName + ': ' + relationships[idx].otherEntityNameCapitalized + '[];');
        }
    }
    for (idx in variables) { %>
    <%- variables[idx] %>
    <%_ } _%>
    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private <%= entityInstance %>Service: <%= entityClass %>Service,<% for (idx in differentRelationships) {%>
        private <%= differentRelationships[idx].otherEntityName %>Service: <%= differentRelationships[idx].otherEntityNameCapitalized %>Service,<% } %>
        private eventManager: EventManager,
        private router: Router
    ) {
        <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(<%- toArrayString(i18nToLoad) %>);
        <%_ } _%>
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        <%_ for (idx in queries) { _%>
        <%- queries[idx] %>
        <%_ } _%>
    }

    clear () {
        this.activeModal.dismiss('cancel');
        this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true });
    }

    save () {
        this.isSaving = true;
        if (this.<%= entityInstance %>.id !== undefined) {
            this.<%= entityInstance %>Service.update(this.<%= entityInstance %>)
                .subscribe((res: Response) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {
            this.<%= entityInstance %>Service.create(this.<%= entityInstance %>)
                .subscribe((res: Response) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result) {
        this.eventManager.broadcast({ name: '<%= entityInstance %>ListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
        this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true });
    }

    private onSaveError (error) {
        this.isSaving = false;
        this.onError(error);
    }

    private onError (error) {
        this.alertService.error(error.message, null, null);
    }
    <%_
    var entitiesSeen = [];
    for (idx in relationships) {
        var otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
            if(entitiesSeen.indexOf(otherEntityNameCapitalized) == -1) {
    _%>

    track<%- otherEntityNameCapitalized -%>ById(index: number, item: <%- relationships[idx].otherEntityNameCapitalized -%>) {
        return item.id;
    }
    <%_ entitiesSeen.push(otherEntityNameCapitalized); } } _%>
    <%_ if (hasManyToMany) { _%>

    getSelected(selectedVals: Array<any>, option: any) {
        if (selectedVals) {
            for (let i = 0; i < selectedVals.length; i++) {
                if (option.id === selectedVals[i].id) {
                    return selectedVals[i];
                }
            }
        }
        return option;
    }
    <%_ } _%>
}

@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>-popup',
    template: ''
})
export class <%= entityAngularJSName %>PopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private <%= entityInstance %>PopupService: <%= entityClass %>PopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if ( params['id'] ) {
                this.modalRef = this.<%= entityInstance %>PopupService
                    .open(<%= entityAngularJSName %>DialogComponent, params['id']);
            } else {
                this.modalRef = this.<%= entityInstance %>PopupService
                    .open(<%= entityAngularJSName %>DialogComponent);
            }

        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
