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

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager<% if (enableTranslation) { %>, JhiLanguageService<% } %> } from 'ng-jhipster';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>PopupService } from './<%= entityFileName %>-popup.service';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';

@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>-delete-dialog',
    templateUrl: './<%= entityFileName %>-delete-dialog.component.html'
})
export class <%= entityAngularJSName %>DeleteDialogComponent {

    <%= entityInstance %>: <%= entityClass %>;

    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        private <%= entityInstance %>Service: <%= entityClass %>Service,
        public activeModal: NgbActiveModal,
        private eventManager: EventManager,
        private router: Router
    ) {
        <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(<%- toArrayString(i18nToLoad) %>);
        <%_ } _%>
    }

    clear () {
        this.activeModal.dismiss('cancel');
        this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true });
    }

    confirmDelete (id: number) {
        this.<%= entityInstance %>Service.delete(id).subscribe(response => {
            this.eventManager.broadcast({
                name: '<%= entityInstance %>ListModification',
                content: 'Deleted an <%= entityInstance %>'
            });
            this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: '<%=jhiPrefix%>-<%= entityFileName %>-delete-popup',
    template: ''
})
export class <%= entityAngularJSName %>DeletePopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private <%= entityInstance %>PopupService: <%= entityClass %>PopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            this.modalRef = this.<%= entityInstance %>PopupService
                .open(<%= entityAngularJSName %>DeleteDialogComponent, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
