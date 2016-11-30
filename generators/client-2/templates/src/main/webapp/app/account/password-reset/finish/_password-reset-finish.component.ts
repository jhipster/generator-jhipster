import { Component, OnInit, Inject, Renderer, ElementRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { PasswordResetFinish } from './password-reset-finish.service';
import { LoginModalService } from "../../../shared";

import { Transition } from 'ui-router-ng2';

@Component({
    selector: 'password-reset-finish',
    templateUrl: './password-reset-finish.component.html'
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
        private loginModalService : LoginModalService,
        private trans: Transition,
        private elementRef: ElementRef, private renderer: Renderer
    ) {}

    ngOnInit() {
        this.resetAccount = {};
        this.keyMissing = !this.trans.params() || !this.trans.params()['key'];
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
            this.passwordResetFinish.save({key: this.trans.params()['key'], newPassword: this.resetAccount.password}).subscribe(() => {
                this.success = 'OK';
            }, () => {
                this.success = null;
                this.error = 'ERROR';
            });
        }
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }
}
