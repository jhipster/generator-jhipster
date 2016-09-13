import {Component, OnInit, Inject, Renderer, ElementRef} from '@angular/core';

@Component({
    selector: 'register',
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
            @Inject('Auth') private auth,
            @Inject('LoginService') private loginService,
            private elementRef: ElementRef,
            private renderer: Renderer) {
    }

    ngOnInit() {
        this.login = this.loginService.open;
        this.success = false;
        this.registerAccount = {};
    }

    ngAfterViewInit() {
        this.renderer.invokeElementMethod(this.elementRef.nativeElement.querySelector('#login'), 'focus', []);
    }

    register() {
        //TODO: remove this once Auth service is migrated
        let vm = this;
        if (this.registerAccount.password !== this.confirmPassword) {
            this.doNotMatch = 'ERROR';
        } else {
            this.registerAccount.langKey = <% if (enableTranslation){ %>this.$translate.use()<% }else {%> 'en' <% } %>;
            this.doNotMatch = null;
            this.error = null;
            this.errorUserExists = null;
            this.errorEmailExists = null;

            this.auth.createAccount(this.registerAccount).then(function () {
                vm.success = true;
            }).catch(function (response) {
                vm.success = null;
                if (response.status === 400 && response.data === 'login already in use') {
                    vm.errorUserExists = 'ERROR';
                } else if (response.status === 400 && response.data === 'e-mail address already in use') {
                    vm.errorEmailExists = 'ERROR';
                } else {
                    vm.error = 'ERROR';
                }
            });
        }
    }
}
