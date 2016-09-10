import { Component, OnInit, Inject } from '@angular/core';
import { Account } from "../shared/model/account.model";

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
        let that = this;
        this.principal.identity().then(function (account) {
            that.account = account;
            that.isAuthenticated = that.principal.isAuthenticated;
        });
    }

    register() {
        this.$state.go('register');
    }
}
