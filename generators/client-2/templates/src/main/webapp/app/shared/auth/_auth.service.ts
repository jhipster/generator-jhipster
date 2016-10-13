import { Injectable, Inject } from '@angular/core';
import { StateService } from 'ui-router-ng2';
import { SessionStorageService } from 'ng2-webstorage';

import { LoginModalService } from "../login/login-modal.service";
import { Principal } from './principal.service';
import { StateStorageService } from './state-storage.service';

@Injectable()
export class AuthService {

    constructor(
        private principal: Principal,
        private $state: StateService,
        private stateStorageService: StateStorageService,
        private loginModalService : LoginModalService,
        @Inject('$rootScope') private $rootScope
    ){}

    authorize (force) {
        var authReturn = this.principal.identity(force).then(authThen.bind(this));

        return authReturn;

        function authThen () {
            var isAuthenticated = this.principal.isAuthenticated();

            // an authenticated user can't access to login and register pages
            if (isAuthenticated && this.$rootScope.toState.parent === 'account' && (this.$rootScope.toState.name === 'login' || this.$rootScope.toState.name === 'register'<% if (authenticationType == 'jwt') { %> || this.$rootScope.toState.name === 'social-auth'<% } %>)) {
                this.$state.go('home');
            }

            // recover and clear previousState after external login redirect (e.g. oauth2)
            var previousState = this.stateStorageService.getPreviousState();
            if (isAuthenticated && !this.$rootScope.fromState.name && previousState) {
                this.stateStorageService.resetPreviousState();
                this.$state.go(previousState.name, previousState.params);
            }

            if (this.$rootScope.toState.data.authorities && this.$rootScope.toState.data.authorities.length > 0 && !this.principal.hasAnyAuthority(this.$rootScope.toState.data.authorities)) {
                if (isAuthenticated) {
                    // user is signed in but not authorized for desired state
                    this.$state.go('accessdenied');
                }
                else {
                    // user is not authenticated. stow the state they wanted before you
                    // send them to the login service, so you can return them when you're done
                    this.stateStorageService.storePreviousState(this.$rootScope.toState.name, this.$rootScope.toStateParams);

                    // now, send them to the signin state so they can log in
                    this.$state.go('accessdenied').then(() => {
                        this.loginModalService.open();
                    });
                }
            }
        }
    }
}
