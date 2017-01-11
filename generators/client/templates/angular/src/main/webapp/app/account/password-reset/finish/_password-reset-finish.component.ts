import { Component, OnInit, Renderer, ElementRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

import { PasswordResetFinish } from './password-reset-finish.service';
import { LoginModalService } from '../../../shared';

@Component({
    selector: '<%=jhiPrefix%>-password-reset-finish',
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
    key: string;

    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        private passwordResetFinish: PasswordResetFinish,
        private loginModalService: LoginModalService,
        private route: ActivatedRoute,
        private elementRef: ElementRef, private renderer: Renderer
    ) {
        <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(['reset']);
        <%_ } _%>
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.key = params['key'];
        });
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
            this.passwordResetFinish.save({key: this.key, newPassword: this.resetAccount.password}).subscribe(() => {
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
