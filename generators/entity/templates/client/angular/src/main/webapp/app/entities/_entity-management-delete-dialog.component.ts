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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

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
        private <%= entityInstance %>Service: <%= entityAngularName %>Service,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: <% if (pkType === 'String') { %>string<% } else { %>number<% } %>) {
        this.<%= entityInstance %>Service.delete(id).subscribe((response) => {
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

    constructor(
        private route: ActivatedRoute,
        private <%= entityInstance %>PopupService: <%= entityAngularName %>PopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.modalRef = this.<%= entityInstance %>PopupService
                .open(<%= entityAngularName %>DeleteDialogComponent, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
