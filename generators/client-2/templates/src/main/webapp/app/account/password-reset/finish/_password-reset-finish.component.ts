import {Component, OnInit, Inject, Renderer, ElementRef} from '@angular/core';

@Component({
    selector: 'password-reset-finish',
    templateUrl: 'app/account/password-reset/finish/password-reset-finish.html'
})
export class PasswordResetFinishComponent implements OnInit {
    confirmPassword: string;
    doNotMatch: string;
    error: string;
    keyMissing: boolean;
    login: any;
    resetAccount: any;
    success: string;

    constructor(@Inject('Auth') private Auth, @Inject('LoginService') private LoginService,
                @Inject('$stateParams') private $stateParams,
                private elementRef: ElementRef, private renderer: Renderer) {}

    ngOnInit() {
        this.resetAccount = {};
        this.login = this.LoginService.open;
        this.keyMissing = !this.$stateParams || !this.$stateParams.key;
    }

    ngAfterViewInit() {
        if (this.elementRef.nativeElement.querySelector('#password') != null) {
          this.renderer.invokeElementMethod(this.elementRef.nativeElement.querySelector('#password'), 'focus', []);
        }
    }

    finishReset() {
        this.doNotMatch = null;
        this.error = null;
        if (this.resetAccount.password !== this.confirmPassword) {
            this.doNotMatch = 'ERROR';
        } else {
            this.Auth.resetPasswordFinish({key: this.$stateParams.key, newPassword: this.resetAccount.password}).then(() => {
                this.success = 'OK';
            }).catch(() => {
                this.success = null;
                this.error = 'ERROR';
            });
        }
    }
}
