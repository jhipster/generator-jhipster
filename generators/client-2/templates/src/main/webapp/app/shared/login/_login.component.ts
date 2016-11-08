import { Component, OnInit, Inject, Renderer, ElementRef } from '@angular/core';
import { NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StateService } from "ui-router-ng2";

<%_ if (enableTranslation){ _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from '../language/language.service';
<%_ } _%>
import { LoginService } from '../login/login.service';
import { StateStorageService } from '../auth/state-storage.service';
<%_ if (enableSocialSignIn) { _%>
import { SocialService } from '../social/social.service';
<%_ } _%>

@Component({
    selector: '<%=jhiPrefix%>-login-modal',
    templateUrl: './login.html'
})
export class <%=jhiPrefixCapitalized%>LoginModalComponent implements OnInit {
    authenticationError: boolean;
    password: string;
    rememberMe: boolean;
    username: string;
    credentials: any;

    constructor(
        @Inject('$rootScope') private $rootScope,
        private $state: StateService,
        <%_ if (enableTranslation){ _%>
        private languageService: <%=jhiPrefixCapitalized%>LanguageService,
        <%_ } _%>
        private loginService: LoginService,
        private stateStorageService: StateStorageService,
        private elementRef: ElementRef,
        private renderer: Renderer,
        <%_ if (enableSocialSignIn) { _%>
        private socialService: SocialService,
        <%_ } _%>
        private activeModal: NgbActiveModal
    ) {
        this.credentials = {};
    }

    ngOnInit() {
        <%_ if (enableTranslation){ _%>
        this.languageService.addLocation('login');
        <%_ } _%>
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
        this.activeModal.dismiss('cancel');
    }

    login () {
        this.loginService.login({
            username: this.username,
            password: this.password,
            rememberMe: this.rememberMe
        }).then(() => {
            this.authenticationError = false;
            this.activeModal.dismiss('login success');
            if (this.$state.current.name === 'register' || this.$state.current.name === 'activate' ||
                this.$state.current.name === 'finishReset' || this.$state.current.name === 'requestReset') {
                this.$state.go('home');
            }

            this.$rootScope.$broadcast('authenticationSuccess');

            // previousState was set in the authExpiredInterceptor before being redirected to login modal.
            // since login is succesful, go to stored previousState and clear previousState
            var previousState = this.stateStorageService.getPreviousState();
            if (previousState) {
                this.stateStorageService.resetPreviousState();
                this.$state.go(previousState.name, previousState.params);
            }
        }).catch(() => {
            this.authenticationError = true;
        });
    }

    register () {
        this.activeModal.dismiss('to state register');
        this.$state.go('register');
    }

    requestResetPassword () {
        this.activeModal.dismiss('to state requestReset');
        this.$state.go('requestReset');
    }
}
