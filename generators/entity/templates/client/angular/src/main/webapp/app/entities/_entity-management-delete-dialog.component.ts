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

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager<% if (enableTranslation) { %>, JhiLanguageService<% } %> } from 'ng-jhipster';

import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
import { <%= entityAngularName %>PopupService } from './<%= entityFileName %>-popup.service';
import { <%= entityAngularName %>Service } from './<%= entityFileName %>.service';

@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>-delete-dialog',
    templateUrl: './<%= entityFileName %>-delete-dialog.component.html'
})
export class <%= entityAngularName %>DeleteDialogComponent {

    <%= entityInstance %>: <%= entityAngularName %>;

    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        private <%= entityInstance %>Service: <%= entityAngularName %>Service,
        public activeModal: NgbActiveModal,
        private eventManager: EventManager
    ) {
        <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(<%- toArrayString(i18nToLoad) %>);
        <%_ } _%>
    }

    clear () {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete (id: number) {
        this.<%= entityInstance %>Service.delete(id).subscribe(response => {
            this.eventManager.broadcast({
                name: '<%= entityInstance %>ListModification',
                content: 'Deleted an <%= entityInstance %>'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: '<%=jhiPrefix%>-<%= entityFileName %>-delete-popup',
    template: ''
})
export class <%= entityAngularName %>DeletePopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private <%= entityInstance %>PopupService: <%= entityAngularName %>PopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            this.modalRef = this.<%= entityInstance %>PopupService
                .open(<%= entityAngularName %>DeleteDialogComponent, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
