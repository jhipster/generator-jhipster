import { Component, Inject, OnInit } from '@angular/core';
import { Activate } from './activate.service';
import { LoginService } from "../../components/login/login.service";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'activate',
    templateUrl: 'app/account/activate/activate.html'
})
export class ActivateComponent implements OnInit {
    error: string;
    success: string;
    modalRef: NgbModalRef;

    constructor(private activate: Activate,
                private loginService : LoginService,
                private modalService: NgbModal,
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

    login(template) {
        this.modalRef = this.modalService.open(template);
        this.loginService.open(template, this.modalRef);
    }
}
