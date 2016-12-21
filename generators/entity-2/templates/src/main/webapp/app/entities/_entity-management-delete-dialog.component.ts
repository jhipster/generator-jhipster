import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';
import { EventManager } from '../../shared/service/event-manager.service';

@Component({
    selector: '<%= entityFileName %>-mgmt-delete-dialog',
    templateUrl: './<%= entityFileName %>-management-delete-dialog.component.html'
})
export class <%= entityClass %>MgmtDeleteDialogComponent {

    <%= entityInstance %>: <%= entityClass %>;

    constructor(private <%= entityInstance %>Service: <%= entityClass %>Service, public activeModal: NgbActiveModal, private eventManager: EventManager) {}

    clear () {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete (id) {
        this.<%= entityInstance %>Service.delete(id).subscribe(response => {
            this.eventManager.broadcast({ name: '<%= entityInstance %>ListModification', content:'Deleted an <%= entityInstance %>'});
            this.activeModal.dismiss(true);
        });
    }

}
