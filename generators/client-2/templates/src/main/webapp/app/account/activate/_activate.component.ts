import { Component, Inject, OnInit } from '@angular/core';
import { Activate } from './activate.service';

@Component({
    selector: 'activate',
    templateUrl: 'app/account/activate/activate.html'
})
export class ActivateComponent implements OnInit {
    error: string;
    login: Function;
    success: string;

    constructor(private activate: Activate, @Inject('LoginService') private LoginService, @Inject('$stateParams') private $stateParams) {
        this.login = this.LoginService.open;
    }

    ngOnInit () {
        this.activate.get(this.$stateParams.key).subscribe(() => {
            this.error = null;
            this.success = 'OK';
        }, () => {
            this.success = null;
            this.error = 'ERROR';
        });
    }

}
