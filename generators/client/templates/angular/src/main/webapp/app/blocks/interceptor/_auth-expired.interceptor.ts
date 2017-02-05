import { HttpInterceptor } from 'ng-jhipster';
import { RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Injector } from '@angular/core';
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthService } from '../../shared/auth/auth.service';
import { Principal } from '../../shared/auth/principal.service';
    <%_ if (authenticationType === 'oauth2') { _%>
import { AuthServerProvider } from '../../shared/auth/auth-oauth2.service';
    <%_ } else { _%>
import { AuthServerProvider } from '../../shared/auth/auth-jwt.service';
    <%_ } _%>
<%_ } if (authenticationType === 'session') { _%>
import { AuthServerProvider } from '../../shared/auth/auth-session.service';
import { StateStorageService } from '../../shared/auth/state-storage.service';
import { LoginModalService } from '../../shared/login/login-modal.service';
<%_ } _%>

export class AuthExpiredInterceptor extends HttpInterceptor {

<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    constructor(private injector: Injector) {
        super();
    }
<%_ } if (authenticationType === 'session') { _%>
    constructor(private injector: Injector,
        private stateStorageService: StateStorageService) {

        super();
    }
<%_ } _%>

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        let self = this;

        return <Observable<Response>> observable.catch((error, source) => {
            if (error.status === 401) {
                let principal: Principal = self.injector.get(Principal);

                if (principal.isAuthenticated()) {
                    let auth: AuthService = self.injector.get(AuthService);
                    auth.authorize(true);
                }
            }
            return Observable.throw(error);
        });
    }
<%_ } if (authenticationType === 'session') { _%>
    responseIntercept(observable: Observable<Response>): Observable<Response> {
        let self = this;

        return <Observable<Response>> observable.catch((error) => {
            <%_ // TODO this is ng1 way...the ng2 would be more like someRouterService.subscribe(url).forEach.. this needs to be updated _%>
            if (error.status === 401 && error.text() !== '' && error.json().path && error.json().path.indexOf('/api/account') === -1) {
                let authServerProvider = self.injector.get(AuthServerProvider);
                let destination = this.stateStorageService.getDestinationState();
                let to = destination.destination;
                let toParams = destination.params;
                authServerProvider.logout();

                if (to.name === 'accessdenied') {
                    self.stateStorageService.storePreviousState(to.name, toParams);
                }

                let loginServiceModal = self.injector.get(LoginModalService);
                loginServiceModal.open();

            }
            return Observable.throw(error);
        });
    }
<%_ } _%>
}
