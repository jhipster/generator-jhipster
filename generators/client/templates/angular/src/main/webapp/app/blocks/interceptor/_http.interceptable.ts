import { Observable } from 'rxjs/Observable';
import { Response, RequestOptionsArgs } from '@angular/http';

/**
 * A HTTP interceptable responsibility chain member is a class, which may react on request and response of all requests
 * done by HTTP.
 */
export abstract class HttpInterceptable {
    private _successor: HttpInterceptable = null;

    set successor(successor: HttpInterceptable) {
        this._successor = successor;
    }

    processRequestInterception(options?: RequestOptionsArgs): RequestOptionsArgs {
        return (!this._successor) ? this.requestIntercept(options) :
            this._successor.processRequestInterception(this.requestIntercept(options));
    }

    processResponseInterception(response: Observable<Response>): Observable<Response> {
        return (!this._successor) ? this.responseIntercept(response) :
            this._successor.processResponseInterception(this.responseIntercept(response));
    }

    abstract requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs;

    abstract responseIntercept(observable: Observable<Response>): Observable<Response>;

}
