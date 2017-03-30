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
import { Response } from '@angular/http';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, AlertService<% if (enableTranslation) { %>, JhiLanguageService<% } %><% if (fieldsContainBlob) { %>, DataUtils<% } %> } from 'ng-jhipster';

import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
import { <%= entityAngularName %>PopupService } from './<%= entityFileName %>-popup.service';
import { <%= entityAngularName %>Service } from './<%= entityFileName %>.service';
<%_ for (const rel of differentRelationships) {
    if (rel.relationshipType != 'one-to-many') { _%>
import { <%= rel.otherEntityAngularName %>, <%= rel.otherEntityAngularName%>Service } from '../<%= rel.otherEntityModulePath %>';
<%_ }
} _%>
<%_
// TODO replace ng-file-upload dependency by an ng2 depedency
// TODO Find a better way to format dates so that it works with NgbDatePicker
_%>

@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>-dialog',
    templateUrl: './<%= entityFileName %>-dialog.component.html'
})
export class <%= entityAngularName %>DialogComponent implements OnInit {

    <%= entityInstance %>: <%= entityAngularName %>;
    authorities: any[];
    isSaving: boolean;
    <%_
    const queries = [];
    const variables = [];
    let hasManyToMany = false;
    for (const idx in relationships) {
        let query;
        let variableName;
        hasManyToMany = hasManyToMany || relationships[idx].relationshipType == 'many-to-many';
        if (relationships[idx].relationshipType == 'one-to-one' && relationships[idx].ownerSide == true && relationships[idx].otherEntityName != 'user') {
            variableName = relationships[idx].relationshipFieldNamePlural.toLowerCase();
            if (variableName === entityInstance) {
                variableName += 'Collection';
            }
            const relationshipFieldName = "this." + entityInstance + "." + relationships[idx].relationshipFieldName;
            query  = "this." + relationships[idx].otherEntityName + "Service.query({filter: '" + relationships[idx].otherEntityRelationshipName.toLowerCase() + "-is-null'}).subscribe((res: Response) => {"
            if (dto === "no") {
                query += "\n            if (!" + relationshipFieldName + " || !" + relationshipFieldName + ".id) {"
            } else {
                query += "\n            if (!" + relationshipFieldName + "Id) {"
            }
            query += "\n                this." + variableName + " = res.json();"
            query += "\n            } else {"
            query += "\n                this." + relationships[idx].otherEntityName + "Service.find(" + relationshipFieldName + (dto == 'no' ? ".id" : "Id") + ").subscribe((subRes: " + relationships[idx].otherEntityAngularName + ") => {"
            query += "\n                    this." + variableName + " = [subRes].concat(res.json());"
            query += "\n                }, (subRes: Response) => this.onError(subRes.json()));"
            query += "\n            }"
            query += "\n        }, (res: Response) => this.onError(res.json()));"
        } else if (relationships[idx].relationshipType != 'one-to-many') {
            variableName = relationships[idx].otherEntityNameCapitalizedPlural.toLowerCase();
            if (variableName === entityInstance) {
                variableName += 'Collection';
            }
            query = 'this.' + relationships[idx].otherEntityName + 'Service.query().subscribe(';
            query += '\n            (res: Response) => { this.' + variableName + ' = res.json(); }, (res: Response) => this.onError(res.json()));';
        }
        if (variableName && !contains(queries, query)) {
            queries.push(query);
            variables.push(variableName + ': ' + relationships[idx].otherEntityAngularName + '[];');
        }
    }
    for (const idx in variables) { %>
    <%- variables[idx] %>
    <%_ } _%>
    constructor(
        public activeModal: NgbActiveModal,
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        <%_ if (fieldsContainBlob) { _%>
        private dataUtils: DataUtils,
        <%_ } _%>
        private alertService: AlertService,
        private <%= entityInstance %>Service: <%= entityAngularName %>Service,<% for (idx in differentRelationships) {
        if (differentRelationships[idx].relationshipType != 'one-to-many') { %>
        private <%= differentRelationships[idx].otherEntityName %>Service: <%= differentRelationships[idx].otherEntityAngularName %>Service,<% }
        }%>
        private eventManager: EventManager
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
    <%_ if (fieldsContainBlob) { _%>
    byteSize(field) {
        return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        return this.dataUtils.openFile(contentType, field);
    }

    setFileData($event, <%= entityInstance %>, field, isImage) {
        if ($event.target.files && $event.target.files[0]) {
            let $file = $event.target.files[0];
            if (isImage && !/^image\//.test($file.type)) {
                return;
            }
            this.dataUtils.toBase64($file, (base64Data) => {
                <%= entityInstance %>[field] = base64Data;
                <%= entityInstance %>[`${field}ContentType`] = $file.type;
            });
        }
    }
   <%_ } _%>
    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.<%= entityInstance %>.id !== undefined) {
            this.<%= entityInstance %>Service.update(this.<%= entityInstance %>)
                .subscribe((res: <%= entityAngularName %>) =>
                    this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {
            this.<%= entityInstance %>Service.create(this.<%= entityInstance %>)
                .subscribe((res: <%= entityAngularName %>) =>
                    this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result: <%= entityAngularName %>) {
        this.eventManager.broadcast({ name: '<%= entityInstance %>ListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError (error) {
        this.isSaving = false;
        this.onError(error);
    }

    private onError (error) {
        this.alertService.error(error.message, null, null);
    }
    <%_
    const entitiesSeen = [];
    for (idx in relationships) {
        const otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
        if(relationships[idx].relationshipType != 'one-to-many' && entitiesSeen.indexOf(otherEntityNameCapitalized) == -1) {
    _%>

    track<%- otherEntityNameCapitalized -%>ById(index: number, item: <%- relationships[idx].otherEntityAngularName -%>) {
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
export class <%= entityAngularName %>PopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private <%= entityInstance %>PopupService: <%= entityAngularName %>PopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if ( params['id'] ) {
                this.modalRef = this.<%= entityInstance %>PopupService
                    .open(<%= entityAngularName %>DialogComponent, params['id']);
            } else {
                this.modalRef = this.<%= entityInstance %>PopupService
                    .open(<%= entityAngularName %>DialogComponent);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
