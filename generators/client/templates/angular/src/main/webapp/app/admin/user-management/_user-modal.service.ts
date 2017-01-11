import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { UserMgmtDialogComponent } from './user-management-dialog.component';
import { User } from './user.model';
import { UserService } from './user.service';

@Injectable()
export class UserModalService {
    private isOpen = false;
    constructor (
        private modalService: NgbModal,
        private userService: UserService
    ) {}

    open (login?: string): NgbModalRef {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;

        if (login) {
            this.userService.find(login).subscribe(user => this.userModalRef(user));
        } else {
            return this.userModalRef(new User());
        }
    }


    userModalRef(user: User): NgbModalRef {
        let modalRef = this.modalService.open(UserMgmtDialogComponent, { size: 'lg', backdrop: 'static'});
        modalRef.componentInstance.user = user;
        modalRef.result.then(result => {
            console.log(`Closed with: ${result}`);
            this.isOpen = false;
        }, (reason) => {
            console.log(`Dismissed ${reason}`);
            this.isOpen = false;
        });
        return modalRef;
    }
}
