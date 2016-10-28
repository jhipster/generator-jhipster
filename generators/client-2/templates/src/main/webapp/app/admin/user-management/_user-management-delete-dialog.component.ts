import { Component, OnInit, Inject } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { User } from './user.model';
import { UserService } from './user.service';

@Component({
    selector: 'user-mgmt-delete-dialog',
    templateUrl: 'app/admin/user-management/user-management-delete-dialog.html',
    inputs: ['modalRef', 'dismiss']
})
export class UserMgmtDeleteDialogComponent implements OnInit {

    user: User;
    modalRef: NgbModalRef;

    constructor(private userService: UserService, @Inject('$stateParams') private $stateParams) {

    }

    ngOnInit() {
        this.userService.find(this.$stateParams.login).subscribe(response => this.user = response.json());
    }

    clear () {
        this.modalRef.dismiss('cancel');
    }

    confirmDelete (login) {
        this.userService.delete(login).subscribe((response) => {
            this.modalRef.dismiss(true);
        });
    }

}
