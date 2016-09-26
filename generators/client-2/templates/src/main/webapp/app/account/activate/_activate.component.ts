import {Component, Inject, OnInit} from '@angular/core';

@Component({
    selector: 'activate',
    templateUrl: 'app/account/activate/activate.html'
})
export class ActivateComponent implements OnInit {
    error: string;
    login: Function;
    success: string;

    constructor(@Inject('Auth') private Auth, @Inject('LoginService') private LoginService, @Inject('$stateParams') private $stateParams) {
        this.login = this.LoginService.open;
    }

    ngOnInit () {
        this.Auth.activateAccount({key: this.$stateParams.key}).then(() => {
            this.error = null;
            this.success = 'OK';
        }).catch(() => {
            this.success = null;
            this.error = 'ERROR';
        });
    }

}
