import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager } from 'ng-jhipster';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';
import { AlertService } from '../../shared';
<%- include('model-class-import-template.ejs'); -%>
<%- include('service-class-import-template.ejs'); -%>
// TODO replace ng-file-upload dependency by an ng2 depedency
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
            if (dto == "no"){
                query += "\n            if (!" + relationshipFieldName + " || !" + relationshipFieldName + ".id) {"
            } else {
                query += "\n            if (!" + relationshipFieldName + "Id) {"
            }
            query += "\n                this." + variableName + " = res.json();"
            query += "\n            } else {"
            query += "\n                this." + relationships[idx].otherEntityName + "Service.find(" + relationshipFieldName + (dto == 'no' ? ".id" : "Id") + ").subscribe((subRes: Response) => {"
            query += "\n                    this." + variableName + " = [subRes].concat(res.json());"
            query += "\n                }, (res: Response) => this.onError(res.json()))"
            query += "\n            }"
            query += "\n        }, (res: Response) => this.onError(res.json()));"
        } else {
            variableName = relationships[idx].otherEntityNameCapitalizedPlural.toLowerCase();
            query = 'this.' + relationships[idx].otherEntityName + 'Service.query().subscribe((res: Response) => {this.' + variableName + ' = res.json()}, (res: Response) => this.onError(res.json()));';
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
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private <%= entityInstance %>Service: <%= entityClass %>Service,<% for (idx in differentRelationships) {%>
        private <%= differentRelationships[idx].otherEntityName %>Service: <%= differentRelationships[idx].otherEntityNameCapitalized %>Service,<% } %>
        private eventManager: EventManager
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        <%_ for (idx in queries) { _%>
        <%- queries[idx] %>
        <%_ } _%>
    }

    clear () {
        this.activeModal.dismiss('cancel');
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
    }

    private onSaveError (error) {
        this.isSaving = false;
        this.onError(error);
    }

    private onError (error) {
        this.alertService.error(error.message, null, null);
    }
    <%_
    for (idx in relationships) {
        var otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized; _%>
    track<%- otherEntityNameCapitalized %>ById(index, item: <%- relationships[idx].otherEntityNameCapitalized %>){
        return item.id;
    }
    <%_ } _%>

    <%_ if (hasManyToMany){ _%>
    getSelected(selectedVals: Array<any>, option: any) {
        if(selectedVals) {
            for (let i = 0; i < selectedVals.length; i++) {
                if (option.id == selectedVals[i].id)
                    return selectedVals[i];
            }
        }
        return option;
    }
    <%_ } _%>
}
