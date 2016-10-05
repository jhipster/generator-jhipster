import { Component, OnInit, Inject, Renderer, ElementRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { PasswordResetFinish } from './password-reset-finish.service';
import { LoginService } from "../../../components";

@Component({
    selector: 'password-reset-finish',
    templateUrl: 'app/account/password-reset/finish/password-reset-finish.html'
})
export class PasswordResetFinishComponent implements OnInit {
    confirmPassword: string;
    doNotMatch: string;
    error: string;
    keyMissing: boolean;
    resetAccount: any;
    success: string;
    modalRef: NgbModalRef;

    constructor(private passwordResetFinish: PasswordResetFinish,
        private loginService : LoginService,
        @Inject('$stateParams') private $stateParams,
        private elementRef: ElementRef, private renderer: Renderer
    ) {}

    ngOnInit() {
        this.resetAccount = {};
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
            this.passwordResetFinish.save({key: this.$stateParams.key, newPassword: this.resetAccount.password}).subscribe(() => {
                this.success = 'OK';
            }, () => {
                this.success = null;
                this.error = 'ERROR';
            });
        }
    }

    login(template) {
        this.modalRef = this.loginService.open(template);
    }
}
