import { Injectable } from '@angular/core';
import { StateService } from 'ui-router-ng2';

import { LoginModalService } from '../login/login-modal.service';
import { Principal } from './principal.service';
import { StateStorageService } from './state-storage.service';

@Injectable()
export class AuthService {

    constructor(
        private principal: Principal,
        private $state: StateService,
        private stateStorageService: StateStorageService,
        private loginModalService: LoginModalService,
    ) {}

    authorize (force) {
        let authReturn = this.principal.identity(force).then(authThen.bind(this));

        return authReturn;

        function authThen () {
            let isAuthenticated = this.principal.isAuthenticated();
            let toStateInfo = this.stateStorageService.getDestinationState().destination;

            // an authenticated user can't access to login and register pages
            if (isAuthenticated && toStateInfo.parent === 'account' && (toStateInfo.name === 'login' || toStateInfo.name === 'register'<% if (authenticationType == 'jwt') { %> || toStateInfo.name === 'social-auth'<% } %>)) {
                this.$state.go('home');
            }

            // recover and clear previousState after external login redirect (e.g. oauth2)
            let fromStateInfo = this.stateStorageService.getDestinationState().from;
            let previousState = this.stateStorageService.getPreviousState();
            if (isAuthenticated && !fromStateInfo.name && previousState) {
                this.stateStorageService.resetPreviousState();
                this.$state.go(previousState.name, previousState.params);
            }

            if (toStateInfo.data.authorities && toStateInfo.data.authorities.length > 0 &&
                !this.principal.hasAnyAuthority(toStateInfo.data.authorities)) {

                if (isAuthenticated) {
                    // user is signed in but not authorized for desired state
                    this.$state.go('accessdenied');
                } else {
                    // user is not authenticated. Show the state they wanted before you
                    // send them to the login service, so you can return them when you're done
                    let toStateParamsInfo = this.stateStorageService.getDestinationState().params;
                    this.stateStorageService.storePreviousState(toStateInfo.name, toStateParamsInfo);
                    // now, send them to the signin state so they can log in
                    this.$state.go('accessdenied').then(() => {
                        this.loginModalService.open();
                    });
                }
            }
        }
    }
}
