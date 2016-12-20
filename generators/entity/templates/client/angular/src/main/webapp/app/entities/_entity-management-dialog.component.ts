import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';
import { <% if (enableTranslation){ %>JhiLanguageService, <% } %>EventManager } from '../../shared';

@Component({
    selector: '<%= entityFileName %>-mgmt-dialog',
    templateUrl: './<%= entityFileName %>-dialog.component.html'
})
export class <%= entityAngularJSName %>DialogComponent implements OnInit {

    <%= entityInstance %>: <%= entityClass %>;
    languages: any[];
    authorities: any[];
    isSaving: Boolean;

    constructor(
        public activeModal: NgbActiveModal,
        <%_ if (enableTranslation){ _%>
        private languageService: JhiLanguageService,
        <%_ } _%>
        private <%= entityInstance %>Service: <%= entityClass %>Service,
        private eventManager: EventManager
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        <%_ if (enableTranslation){ _%>
        this.languageService.getAll().then((languages) => {
            this.languages = languages;
        });
        <%_ } _%>
    }

    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.<%= entityInstance %>.id !== null) {
            this.<%= entityInstance %>Service.update(this.<%= entityInstance %>).subscribe(response => this.onSaveSuccess(response), () => this.onSaveError());
        } else {<% if (!enableTranslation){ %>
            this.<%= entityInstance %>.langKey = 'en';<% } %>
            this.<%= entityInstance %>Service.create(this.<%= entityInstance %>).subscribe(response => this.onSaveSuccess(response), () => this.onSaveError());
        }
    }

    private onSaveSuccess (result) {
        this.eventManager.broadcast({ name: '<%= entityInstance %>ListModification', content:'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError () {
        this.isSaving = false;
    }

}
