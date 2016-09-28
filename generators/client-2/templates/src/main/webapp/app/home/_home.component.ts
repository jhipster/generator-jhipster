import { Component, OnInit, Inject } from '@angular/core';
import { StateService } from "ui-router-ng2";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Account } from '../shared';
import { Principal } from "../components";

@Component({
    selector: 'home',
    templateUrl: 'app/home/home.html'
})
export class HomeComponent implements OnInit {
    account: Account;
    modalRef: NgbModalRef;

    constructor(private principal: Principal,
                private $state: StateService,
                private modalService: NgbModal,
                @Inject('LoginService') loginService) {

    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    register() {
        this.$state.go('register');
    }

    login(template) {
        this.modalRef = this.modalService.open(template);
        this.loginService.open(template, this.modalRef);
    }
}
