import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { <%=jhiPrefixCapitalized%>LoginModalComponent } from './login.component';

@Injectable()
export class LoginModalService {

    constructor (
        private modalService: NgbModal,
    ) {}

    open (): NgbModalRef {
        let modalRef = this.modalService.open(<%=jhiPrefixCapitalized%>LoginModalComponent);
        modalRef.result.then(result => {
            console.log(`Closed with: ${result}`);
        }, (reason) => {
            console.log(`Dismissed ${reason}`);
        });
        return modalRef;
    }
}
