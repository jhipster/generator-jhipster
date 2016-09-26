import {Component, OnInit, Inject, Renderer, ElementRef} from '@angular/core';

@Component({
    selector: 'password-reset-init',
    templateUrl: 'app/account/password-reset/init/password-reset-init.html'
})
export class PasswordResetInitComponent implements OnInit {
    error: string;
    errorEmailNotExists: string;
    resetAccount: any;
    success: string;

    constructor(@Inject('Auth') private Auth, private elementRef: ElementRef, private renderer: Renderer) {}

    ngOnInit() {
        this.resetAccount = {};
    }

    ngAfterViewInit() {
        this.renderer.invokeElementMethod(this.elementRef.nativeElement.querySelector('#email'), 'focus', []);
    }

    requestReset () {

        this.error = null;
        this.errorEmailNotExists = null;

        this.Auth.resetPasswordInit(this.resetAccount.email).then(() => {
            this.success = 'OK';
        }).catch((response) => {
            this.success = null;
            if (response.status === 400 && response.data === 'e-mail address not registered') {
                this.errorEmailNotExists = 'ERROR';
            } else {
                this.error = 'ERROR';
            }
        });
    }
}
