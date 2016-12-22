import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';
import { <% if (enableTranslation){ %>JhiLanguageService, <% } %>EventManager, AlertService } from '../../shared';
<%- include('model-class-import-template.ejs'); -%>
<%- include('service-class-import-template.ejs'); -%>

@Component({
    selector: '<%= entityFileName %>-mgmt-dialog',
    templateUrl: './<%= entityFileName %>-dialog.component.html'
})
export class <%= entityAngularJSName %>DialogComponent implements OnInit {

    <%= entityInstance %>: <%= entityClass %>;
    languages: any[];
    authorities: any[];
    isSaving: Boolean;<%
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
    <%- variables[idx] %><% } %>
    constructor(
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        <%_ if (enableTranslation){ _%>
        private languageService: JhiLanguageService,
        <%_ } _%>
        private <%= entityInstance %>Service: <%= entityClass %>Service,<% for (idx in differentRelationships) {%>
        private <%= differentRelationships[idx].otherEntityName %>Service: <%= differentRelationships[idx].otherEntityNameCapitalized %>Service,<% } %>
        private eventManager: EventManager
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        <%_ if (enableTranslation){ _%>
        this.languageService.getAll().then((languages) => {
            this.languages = languages;
        });
        <%_ } _%><% for (idx in queries) { %>
        <%- queries[idx] %><% } %>
    }

    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.<%= entityInstance %>.id !== undefined) {
            this.<%= entityInstance %>Service.update(this.<%= entityInstance %>).subscribe((res: Response) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {<% if (!enableTranslation){ %>
            this.<%= entityInstance %>.langKey = 'en';<% } %>
            this.<%= entityInstance %>Service.create(this.<%= entityInstance %>).subscribe((res: Response) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result) {
        this.eventManager.broadcast({ name: '<%= entityInstance %>ListModification', content:'OK'});
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
<% if (hasManyToMany){ %>
    getSelected(selectedVals: Array<any>, option: any) {
        if(selectedVals) {
            for (let i = 0; i < selectedVals.length; i++) {
                if (option.id == selectedVals[i].id)
                    return selectedVals[i];
            }
        }
        return option;
    }
<% } %>
}
