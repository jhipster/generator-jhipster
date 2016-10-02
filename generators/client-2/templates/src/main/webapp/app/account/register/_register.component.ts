import { Component, OnInit, Inject, Renderer, ElementRef } from '@angular/core';
import { Register } from './register.service';

@Component({
    selector: '<%=jhiPrefix%>-register',
    templateUrl: 'app/account/register/register.html'
})
export class RegisterComponent implements OnInit {

    confirmPassword: string;
    doNotMatch: string;
    error: string;
    errorEmailExists: string;
    errorUserExists: string;
    login: Function;
    registerAccount: any;
    success: boolean;

    constructor(
            @Inject('$translate') private $translate,
            @Inject('LoginService') private loginService,
            private registerService: Register,
            private elementRef: ElementRef,
            private renderer: Renderer) {
        this.login = loginService.open;
    }

    ngOnInit() {
        this.success = false;
        this.registerAccount = {};
    }

    ngAfterViewInit() {
        this.renderer.invokeElementMethod(this.elementRef.nativeElement.querySelector('#login'), 'focus', []);
    }

    register() {
        if (this.registerAccount.password !== this.confirmPassword) {
            this.doNotMatch = 'ERROR';
        } else {
            this.registerAccount.langKey = <% if (enableTranslation){ %>this.$translate.use()<% }else {%> 'en' <% } %>;
            this.doNotMatch = null;
            this.error = null;
            this.errorUserExists = null;
            this.errorEmailExists = null;

            this.registerService.save(this.registerAccount).subscribe(() => {
                this.success = true;
            }, (response) => {
                //TODO handle this.logout(); on error
                this.success = null;
                if (response.status === 400 && response.data === 'login already in use') {
                    this.errorUserExists = 'ERROR';
                } else if (response.status === 400 && response.data === 'e-mail address already in use') {
                    this.errorEmailExists = 'ERROR';
                } else {
                    this.error = 'ERROR';
                }
            });
        }
    }
}
