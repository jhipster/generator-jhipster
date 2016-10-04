import * as angular from 'angular';
import { Component, OnInit, Inject, Renderer, ElementRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: '<%=jhiPrefix%>-login-modal',
    templateUrl: 'app/components/login/login.html',
    inputs: ['modalRef', 'dismiss']
})
export class <%=jhiPrefixCapitalized%>LoginModalComponent implements OnInit {
    authenticationError: boolean;
    password: string;
    rememberMe: boolean;
    username: string;
    credentials: any;
    modalRef: NgbModalRef;

    constructor(@Inject('Auth') private Auth,
                @Inject('Principal') private Principal,
                //@Inject('$rootScope') private $rootScope,
                @Inject('$state') private $state,
                private elementRef: ElementRef,
                private renderer: Renderer) {
        this.credentials = {};
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.renderer.invokeElementMethod(this.elementRef.nativeElement.querySelector('#username'), 'focus', []);
    }

    cancel () {
        this.credentials = {
            username: null,
            password: null,
            rememberMe: true
        };
        this.authenticationError = false;
        this.modalRef.dismiss('cancel');
    }

    login () {
        this.Auth.login({
            username: this.username,
            password: this.password,
            rememberMe: this.rememberMe
        }).then(() => {
            this.authenticationError = false;
            this.modalRef.dismiss('cancel');
            if (this.$state.current.name === 'register' || this.$state.current.name === 'activate' ||
                this.$state.current.name === 'finishReset' || this.$state.current.name === 'requestReset') {
                this.$state.go('home');
            }

            //this.$rootScope.$broadcast('authenticationSuccess');

            // previousState was set in the authExpiredInterceptor before being redirected to login modal.
            // since login is succesful, go to stored previousState and clear previousState
            if (this.Auth.getPreviousState()) {
                var previousState = this.Auth.getPreviousState();
                this.Auth.resetPreviousState();
                this.$state.go(previousState.name, previousState.params);
            }
        }).catch(() => {
            this.authenticationError = true;
        });
    }

    register () {
        this.modalRef.dismiss('cancel');
        this.$state.go('register');
    }

    requestResetPassword () {
        this.modalRef.dismiss('cancel');
        this.$state.go('requestReset');
    }
}
