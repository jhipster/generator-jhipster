import {HttpInterceptable} from "./http.interceptable";
import {RequestOptionsArgs, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {Injector} from "@angular/core";
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import {AuthService} from "../../shared/auth/auth.service";
import {Principal} from "../../shared/auth/principal.service";
<%_ } if (authenticationType === 'session') { _%>
import {AuthServerProvider} from "../../shared/auth/auth-jwt.service";
import {StateStorageService} from "../../shared/auth/state-storage.service";
<% } %>


export class AuthExpiredInterceptor extends HttpInterceptable {

<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    constructor(private injector : Injector) {
        super();
    }
<%_ } if (authenticationType === 'session') { _%>
    constructor(private injector : Injector, private $rootScope, private stateStorageService : StateStorageService) {
        super();
    }
<% } %>
    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }

<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    responseIntercept(observable: Observable<Response>): Observable<Response> {
        let self = this;

        return <Observable<Response>> observable.catch((error, source) => {
            if(error.status === 401) {
                let principal : Principal = self.injector.get(Principal);

                if(principal.isAuthenticated()) {
                    let auth : AuthService = self.injector.get(AuthService);
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
            //todo: this is ng1 way...the ng2 would be more like someRouterService.subscribe(url).forEach..... but I don't know how to do this bow
            if(error.status === 401 && !!error.data.path && error.data.path.indexOf("/api/account") === -1) {
                let authServerProvider = self.injector.get(AuthServerProvider);
                let to = self.$rootScope.toState;
                let toParams = self.$rootScope.toStateParams;
                authServerProvider.logout();

                if(to.name === 'accessdenied') {
                    self.stateStorageService.storePreviousState(to.name, toParams);
                }

                return Observable.throw(error);
            }
        });
    }
<% } %>

}

