import { Component, Inject, OnInit } from "@angular/core";
import { TranslatePipe } from '../../shared/translate.pipe';

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
        Auth: any;
        Principal: any;

        constructor(@Inject('Auth') Auth, @Inject('Principal') Principal) {
            this.Auth = Auth;
            this.Principal = Principal;
        }

        ngOnInit () {
            let vm = this;
            this.Principal.identity().then(function(account) {
                vm.account = account;
            });
        }

        changePassword () {
            if (this.password !== this.confirmPassword) {
                this.error = null;
                this.success = null;
                this.doNotMatch = 'ERROR';
            } else {
                this.doNotMatch = null;
                let vm = this;
                this.Auth.changePassword(this.password).then(function () {
                    vm.error = null;
                    vm.success = 'OK';
                }).catch(function () {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
            }
        }
    }