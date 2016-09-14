import {Component, OnInit, Inject, Renderer, ElementRef} from '@angular/core';
import { TranslatePipe } from '../../../shared/translate.pipe';

@Component({
    selector: 'password-reset-init',
    templateUrl: 'app/account/password-reset/init/password-reset-init.html'
})
export class PasswordResetInitComponent implements OnInit {
    error: string;
    errorEmailNotExists: string;
    resetAccount: any;
    success: string;
    Auth: any;

    constructor(@Inject('Auth') Auth, private elementRef: ElementRef, private renderer: Renderer) {
        this.Auth = Auth;
    }

    ngOnInit() {
        this.resetAccount = {};
    }

    ngAfterViewInit() {
        this.renderer.invokeElementMethod(this.elementRef.nativeElement.querySelector('#email'), 'focus', []);
    }

    requestReset () {

        this.error = null;
        this.errorEmailNotExists = null;

        let vm = this;
        this.Auth.resetPasswordInit(this.resetAccount.email).then(function () {
            vm.success = 'OK';
        }).catch(function (response) {
            vm.success = null;
            if (response.status === 400 && response.data === 'e-mail address not registered') {
                vm.errorEmailNotExists = 'ERROR';
            } else {
                vm.error = 'ERROR';
            }
        });
    }
}
