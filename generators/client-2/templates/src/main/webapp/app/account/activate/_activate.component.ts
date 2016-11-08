import { Component, Inject, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Activate } from './activate.service';
import { LoginModalService } from "../../shared";

@Component({
    selector: 'activate',
    templateUrl: './activate.html'
})
export class ActivateComponent implements OnInit {
    error: string;
    success: string;
    modalRef: NgbModalRef;

    constructor(
        private activate: Activate,
        private loginModalService : LoginModalService,
        @Inject('$stateParams') private $stateParams
    ) {}

    ngOnInit () {
        this.activate.get(this.$stateParams.key).subscribe(() => {
            this.error = null;
            this.success = 'OK';
        }, () => {
            this.success = null;
            this.error = 'ERROR';
        });
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }
}
