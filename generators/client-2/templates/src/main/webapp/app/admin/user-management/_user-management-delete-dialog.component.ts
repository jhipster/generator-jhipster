import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './user.model';
import { UserService } from './user.service';
import { EventManager } from '../../shared/service/event-manager.service';

@Component({
    selector: 'user-mgmt-delete-dialog',
    templateUrl: './user-management-delete-dialog.component.html'
})
export class UserMgmtDeleteDialogComponent {

    user: User;

    constructor(private userService: UserService, public activeModal: NgbActiveModal, private eventManager: EventManager) {}

    clear () {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete (login) {
        this.userService.delete(login).subscribe(response => {
            this.eventManager.broadcast({ name: 'userListModification', content:'Deleted an user'});
            this.activeModal.dismiss(true);
        });
    }

}
