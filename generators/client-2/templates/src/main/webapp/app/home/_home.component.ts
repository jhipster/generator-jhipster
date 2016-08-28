import { Component, OnInit, Inject } from '@angular/core';
import { Account } from "../shared/account.model";

@Component({
    selector: 'home',
    templateUrl: 'app/home/home.html'
})
export class HomeComponent implements OnInit {
    account: Account;
    login: Function;
    isAuthenticated: Function;

    constructor(@Inject('Principal') private principal,
                @Inject('$state') private $state,
                @Inject('LoginService') loginService) {
        this.login = loginService.open;
    }

    ngOnInit() {
        //TODO: Remove this line after migrating "Principal" service
        this.principal.identity().then(function (account) {
            this.account = account;
            this.isAuthenticated = this.principal.isAuthenticated;
        }.bind(this));
    }

    register() {
        this.$state.go('register');
    }
}
