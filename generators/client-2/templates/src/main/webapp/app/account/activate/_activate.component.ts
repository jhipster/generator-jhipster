import {Component, Inject, OnInit} from '@angular/core';

@Component({
    selector: 'activate',
    templateUrl: 'app/account/activate/activate.html'
})
export class ActivateComponent implements OnInit {
    error: string;
    login: Function;
    success: string;
    Auth: any;
    LoginService: any;
    $stateParams: any;

    constructor(@Inject('Auth') Auth, @Inject('LoginService') LoginService, @Inject('$stateParams') $stateParams) {
        this.Auth = Auth;
        this.LoginService = LoginService;
        this.$stateParams = $stateParams;
        this.login = this.LoginService.open;
    }

    ngOnInit () {
        let vm = this;
        this.Auth.activateAccount({key: this.$stateParams.key}).then(function () {
            vm.error = null;
            vm.success = 'OK';
        }).catch(function () {
            vm.success = null;
            vm.error = 'ERROR';
        });
    }

}
