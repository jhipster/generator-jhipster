import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager } from 'ng-jhipster';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';

@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>-delete-dialog',
    templateUrl: './<%= entityFileName %>-delete-dialog.component.html'
})
export class <%= entityAngularJSName %>DeleteDialogComponent {

    <%= entityInstance %>: <%= entityClass %>;

    constructor(
        private <%= entityInstance %>Service: <%= entityClass %>Service,
        public activeModal: NgbActiveModal,
        private eventManager: EventManager
    ) {}

    clear () {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete (id) {
        this.<%= entityInstance %>Service.delete(id).subscribe(response => {
            this.eventManager.broadcast({ name: '<%= entityInstance %>ListModification', content: 'Deleted an <%= entityInstance %>'});
            this.activeModal.dismiss(true);
        });
    }
}
