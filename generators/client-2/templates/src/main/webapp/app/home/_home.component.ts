import { Component, OnInit, Inject } from '@angular/core';
import { StateService } from "ui-router-ng2";
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Account, LoginService, Principal } from "../shared";

@Component({
    selector: 'home',
    templateUrl: 'app/home/home.html'
})
export class HomeComponent implements OnInit {
    account: Account;
    modalRef: NgbModalRef;

    constructor(private principal: Principal,
                private $state: StateService,
                private loginService : LoginService) {
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
        this.modalRef = this.loginService.open(template);
    }
}
