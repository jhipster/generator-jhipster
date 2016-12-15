import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { <%=jhiPrefixCapitalized%>LoginModalComponent } from './login.component';

@Injectable()
export class LoginModalService {
    private isOpen = false;
    constructor (
        private modalService: NgbModal,
    ) {}

    open (): NgbModalRef {
        if(this.isOpen) {
            return;
        }
        this.isOpen = true;
        let modalRef = this.modalService.open(<%=jhiPrefixCapitalized%>LoginModalComponent);
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
