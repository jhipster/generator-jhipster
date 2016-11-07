import { Observable } from 'rxjs/Observable';
import { RequestOptionsArgs, Response } from '@angular/http';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { HttpInterceptable } from './http.interceptable';

export class AuthInterceptor extends HttpInterceptable {

    constructor(
        private localStorage : LocalStorageService,
        private sessionStorage : SessionStorageService
    ) {
        super();
    }

    requestIntercept(options? : RequestOptionsArgs) : RequestOptionsArgs {
        let jwtToken = this.localStorage.retrieve('authenticationToken') || this.sessionStorage.retrieve('authenticationToken');

        if(!!jwtToken) {
            options.headers.append('Authorization', 'Bearer ' + jwtToken);
        }

        return options;
    }

    responseIntercept(observable : Observable<Response>) : Observable<Response> {
        return observable; //by pass
    }

}
