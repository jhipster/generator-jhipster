import { Component, OnInit } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';

import { Principal } from '../../shared';
import { Password } from './password.service';

@Component({
    selector: '<%=jhiPrefix%>-password',
    templateUrl: './password.component.html'
})
export class PasswordComponent implements OnInit {
    doNotMatch: string;
    error: string;
    success: string;
    account: any;
    password: string;
    confirmPassword: string;

    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        private passwordService: Password,
        private principal: Principal) {
        <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(['password']);
        <%_ } _%>
    }

    ngOnInit () {
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

    changePassword () {
        if (this.password !== this.confirmPassword) {
            this.error = null;
            this.success = null;
            this.doNotMatch = 'ERROR';
        } else {
            this.doNotMatch = null;
            this.passwordService.save(this.password).subscribe(() => {
                this.error = null;
                this.success = 'OK';
            }, () => {
                this.success = null;
                this.error = 'ERROR';
            });
        }
    }
}
