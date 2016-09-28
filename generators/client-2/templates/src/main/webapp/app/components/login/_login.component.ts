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
        let vm = this;
        this.Auth.login({
            username: this.username,
            password: this.password,
            rememberMe: this.rememberMe
        }).then(function () {
            vm.authenticationError = false;
            vm.modalRef.dismiss('cancel');
            if (vm.$state.current.name === 'register' || vm.$state.current.name === 'activate' ||
                vm.$state.current.name === 'finishReset' || vm.$state.current.name === 'requestReset') {
                vm.$state.go('home');
            }

            //vm.$rootScope.$broadcast('authenticationSuccess');

            // previousState was set in the authExpiredInterceptor before being redirected to login modal.
            // since login is succesful, go to stored previousState and clear previousState
            if (vm.Auth.getPreviousState()) {
                var previousState = vm.Auth.getPreviousState();
                vm.Auth.resetPreviousState();
                vm.$state.go(previousState.name, previousState.params);
            }
        }).catch(function () {
            vm.authenticationError = true;
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
