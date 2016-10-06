import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class LoginService {
    modalInstance: any;

    constructor (private modalService: NgbModal) {
        this.modalInstance = null;
    }

    resetModal () : any {
        this.modalInstance = null;
    }

    open (template): NgbModalRef {
        let modalRef = this.modalService.open(template);
        modalRef.result.then(result => {
            console.log(`Closed with: ${result}`);
        }, (reason) => {
            console.log(`Dismissed ${reason}`);
        });
        return modalRef;
    }
}
