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
    Auth: any;
    LoginService: any;
    $stateParams: any;

    constructor(@Inject('Auth') Auth, @Inject('LoginService') LoginService, @Inject('$stateParams') $stateParams,
                private elementRef: ElementRef, private renderer: Renderer) {
        this.Auth = Auth;
        this.LoginService = LoginService;
        this.$stateParams = $stateParams;
    }

    ngOnInit() {
        this.resetAccount = {};
        this.login = this.LoginService.open;
        this.keyMissing = angular.isUndefined(this.$stateParams.key);
    }

    ngAfterViewInit() {
        if (this.elementRef.nativeElement.querySelector('#password') != null)
          this.renderer.invokeElementMethod(this.elementRef.nativeElement.querySelector('#password'), 'focus', []);
    }

    finishReset() {
        this.doNotMatch = null;
        this.error = null;
        if (this.resetAccount.password !== this.confirmPassword) {
            this.doNotMatch = 'ERROR';
        } else {
            let vm = this;
            this.Auth.resetPasswordFinish({key: this.$stateParams.key, newPassword: this.resetAccount.password}).then(function () {
                vm.success = 'OK';
            }).catch(function () {
                vm.success = null;
                vm.error = 'ERROR';
            });
        }
    }
}
