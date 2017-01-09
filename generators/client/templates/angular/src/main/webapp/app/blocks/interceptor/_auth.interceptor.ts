import { Observable } from 'rxjs/Observable';
import { RequestOptionsArgs, Response } from '@angular/http';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { HttpInterceptor } from 'ng-jhipster';

export class AuthInterceptor extends HttpInterceptor {

    constructor(
        private localStorage: LocalStorageService,
        private sessionStorage: SessionStorageService
    ) {
        super();
    }

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        let token = this.localStorage.retrieve('authenticationToken') || this.sessionStorage.retrieve('authenticationToken');
        <%_ if (authenticationType === 'oauth2') { _%>
        if (token && token.expires_at && token.expires_at > new Date().getTime()) {
            options.headers.append('Authorization', 'Bearer ' + token.access_token);
        }
        <%_ } else if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
        if (!!token) {
            options.headers.append('Authorization', 'Bearer ' + token);
        }
        <%_ } _%>
        return options;
    }

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        return observable; // by pass
    }

}
