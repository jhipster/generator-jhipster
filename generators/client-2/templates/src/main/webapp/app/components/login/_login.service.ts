import * as angular from 'angular';

import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Injectable()
export class LoginService {
    modalInstance: any;

    constructor (private modalService: NgbModal) {
        this.modalInstance = null;
    }

    resetModal () : any {
        this.modalInstance = null;
    }

    open (loginTemplate)  {
        this.modalService.open(loginTemplate).result.then(
            this.resetModal,
            this.resetModal
        );
    }
}
