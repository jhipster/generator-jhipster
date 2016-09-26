import { Component, Inject, OnInit } from "@angular/core";

@Component({
    selector: 'password',
    templateUrl: 'app/account/password/password.html'
})
export class PasswordComponent implements OnInit {
    doNotMatch: string;
    error: string;
    success: string;
    account: any;
    password: string;
    confirmPassword: string;

    constructor(@Inject('Auth') private Auth, @Inject('Principal') private Principal) {}

    ngOnInit () {
        this.Principal.identity().then((account) => {
            this.account = account;
        });
    }

    changePassword () {
        if (this.password !== this.confirmPassword) {
            this.error = null;
            this.success = null;
            this.doNotMatch = 'ERROR';
        } else {
            this.doNotMatch = null;
            this.Auth.changePassword(this.password).then(() => {
                this.error = null;
                this.success = 'OK';
            }).catch(() => {
                this.success = null;
                this.error = 'ERROR';
            });
        }
    }
}
