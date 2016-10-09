import { Injectable, Inject } from '@angular/core';
import { StateService } from 'ui-router-ng2';
import { LoginService } from "../login/login.service";
import { Principal } from './principal.service';
import { AuthServerProvider } from './auth-session.service';
<%_ if (websocket === 'spring-websocket') { _%>
import { <%=jhiPrefixCapitalized%>TrackerService } from '../tracker/tracker.service';
<%_ } _%>

@Injectable()
export class AuthService {

    constructor(
        private principal: Principal,
        private $state: StateService,
        private authServerProvider: AuthServerProvider,
        private loginService : LoginService,
        <%_ if (websocket === 'spring-websocket') { _%>
        private trackerService: <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
        <%_ if (enableTranslation){ _%>
        @Inject('$translate') private $translate,
        <%_ } _%>
        @Inject('$rootScope') private $rootScope,
        @Inject('$sessionStorage') private $sessionStorage
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
            if (isAuthenticated && !this.$rootScope.fromState.name && this.getPreviousState()) {
                var previousState = this.getPreviousState();
                this.resetPreviousState();
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
                    this.storePreviousState(this.$rootScope.toState.name, this.$rootScope.toStateParams);

                    // now, send them to the signin state so they can log in
                    this.$state.go('accessdenied').then(() => {
                        //this.loginService.open(); //TODO needs to fixed once modal supports components
                    });
                }
            }
        }
    }

    login (credentials, callback?) {
        var cb = callback || function(){};

        return new Promise((resolve, reject) => {
            this.authServerProvider.login(credentials).subscribe(data => {
                this.principal.identity(true).then(account => {
                    <%_ if (enableTranslation){ _%>
                    // After the login the language will be changed to
                    // the language selected by the user during his registration
                    if (account!== null) { //TODO migrate
                        this.$translate.use(account.langKey).then(() => {
                            this.$translate.refresh();
                        });
                    }
                    <%_ } _%>
                    <%_ if (websocket === 'spring-websocket') { _%>
                    this.trackerService.sendActivity();
                    <%_ } _%>
                    resolve(data);
                });
                return cb();
            }, err => {
                this.logout();
                reject(err);
                return cb(err);
            });
        });
    }

    <%_ if (authenticationType == 'jwt') { _%>
    loginWithToken(jwt, rememberMe) {
        return this.authServerProvider.loginWithToken(jwt, rememberMe);
    }
    <%_ } _%>

    logout () {
        this.authServerProvider.logout().subscribe();
        this.principal.authenticate(null);
    }

    getPreviousState() {
        var previousState = this.$sessionStorage.previousState;
        return previousState;
    }

    resetPreviousState() {
        delete this.$sessionStorage.previousState;
    }

    storePreviousState(previousStateName, previousStateParams) {
        var previousState = { "name": previousStateName, "params": previousStateParams };
        this.$sessionStorage.previousState = previousState;
    }
}
