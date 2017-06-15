<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
<%_
const i18nToLoad = [entityInstance];
for (const idx in fields) {
    if (fields[idx].fieldIsEnum === true) {
        i18nToLoad.push(fields[idx].enumInstance);
    }
}
_%>
import { Component, OnInit, OnDestroy<% if (fieldsContainImageBlob) { %>, ElementRef<% } %> } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService<% if (fieldsContainBlob) { %>, JhiDataUtils<% } %> } from 'ng-jhipster';

import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
import { <%= entityAngularName %>PopupService } from './<%= entityFileName %>-popup.service';
import { <%= entityAngularName %>Service } from './<%= entityFileName %>.service';
<%_
let hasRelationshipQuery = false;
for (const rel of differentRelationships) {
    if (rel.relationshipType === 'one-to-one' && rel.ownerSide === true && rel.otherEntityName !== 'user') {
        hasRelationshipQuery = true;
    }
    if (rel.relationshipType !== 'one-to-many') {
        hasRelationshipQuery = true;
_%>
import { <%= rel.otherEntityAngularName %>, <%= rel.otherEntityAngularName%>Service } from '../<%= rel.otherEntityModulePath %>';
<%_ }
} _%>
<%_ if (hasRelationshipQuery) { _%>
import { ResponseWrapper } from '../../shared';
<%_ } _%>
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
    const query = generateEntityQueries(relationships, entityInstance, dto);
    const queries = query.queries;
    const variables = query.variables;
    let hasManyToMany = query.hasManyToMany;
    for (const idx in variables) { %>
    <%- variables[idx] %>
    <%_ } _%>
    <%_ for (idx in fields) {
        const fieldName = fields[idx].fieldName;
        const fieldType = fields[idx].fieldType;
        if (fieldType === 'LocalDate') { _%>
    <%= fieldName %>Dp: any;
        <%_ }
    } _%>

    constructor(
        public activeModal: NgbActiveModal,
        <%_ if (fieldsContainBlob) { _%>
        private dataUtils: JhiDataUtils,
        <%_ } _%>
        private alertService: JhiAlertService,
        private <%= entityInstance %>Service: <%= entityAngularName %>Service,<% for (idx in differentRelationships) {
        if (differentRelationships[idx].relationshipType !== 'one-to-many') { %>
        private <%= differentRelationships[idx].otherEntityName %>Service: <%= differentRelationships[idx].otherEntityAngularName %>Service,<% }
        }%>
        <%_ if (fieldsContainImageBlob) { _%>
        private elementRef: ElementRef,
        <%_ } _%>
        private eventManager: JhiEventManager
    ) {
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

    setFileData(event, <%= entityInstance %>, field, isImage) {
        if (event && event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (isImage && !/^image\//.test(file.type)) {
                return;
            }
            this.dataUtils.toBase64(file, (base64Data) => {
                <%= entityInstance %>[field] = base64Data;
                <%= entityInstance %>[`${field}ContentType`] = file.type;
            });
        }
    }

    <%_ if (fieldsContainImageBlob) { _%>
    clearInputImage(field: string, fieldContentType: string, idInput: string) {
        this.dataUtils.clearInputImage(this.<%= entityInstance %>, this.elementRef, field, fieldContentType, idInput);
    }

    <%_ } _%>
    <%_ } _%>
    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.<%= entityInstance %>.id !== undefined) {
            this.subscribeToSaveResponse(
                this.<%= entityInstance %>Service.update(this.<%= entityInstance %>), false);
        } else {
            this.subscribeToSaveResponse(
                this.<%= entityInstance %>Service.create(this.<%= entityInstance %>), true);
        }
    }

    private subscribeToSaveResponse(result: Observable<<%= entityAngularName %>>, isCreated: boolean) {
        result.subscribe((res: <%= entityAngularName %>) =>
            this.onSaveSuccess(res, isCreated), (res: Response) => this.onSaveError(res));
    }

    private onSaveSuccess(result: <%= entityAngularName %>, isCreated: boolean) {
        <%_ if (enableTranslation) { _%>
        this.alertService.success(
            isCreated ? '<%= angularAppName %>.<%= entityTranslationKey %>.created'
            : '<%= angularAppName %>.<%= entityTranslationKey %>.updated',
            { param : result.id }, null);
        <%_ } else { _%>
        this.alertService.success(
            isCreated ? `A new <%= entityClassHumanized %> is created with identifier ${result.id}`
            : `A <%= entityClassHumanized %> is updated with identifier ${result.id}`,
            null, null);
        <%_ } _%>

        this.eventManager.broadcast({ name: '<%= entityInstance %>ListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError(error) {
        try {
            error.json();
        } catch (exception) {
            error.message = error.text();
        }
        this.isSaving = false;
        this.onError(error);
    }

    private onError(error) {
        this.alertService.error(error.message, null, null);
    }
    <%_
    const entitiesSeen = [];
    for (idx in relationships) {
        const otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
        if(relationships[idx].relationshipType !== 'one-to-many' && entitiesSeen.indexOf(otherEntityNameCapitalized) === -1) {
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

    constructor(
        private route: ActivatedRoute,
        private <%= entityInstance %>PopupService: <%= entityAngularName %>PopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
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
