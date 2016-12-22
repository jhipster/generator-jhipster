import { HttpInterceptable } from './http.interceptable';
import { Injectable } from '@angular/core';
import { Http, ConnectionBackend, RequestOptions, RequestOptionsArgs, Request, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HttpInterceptor extends Http {
    private firstInterceptor: HttpInterceptable;

    constructor(
        backend: ConnectionBackend,
        defaultOptions: RequestOptions,
        interceptors: HttpInterceptable[]
    ) {
        super(backend, defaultOptions);

        /**
         * building a responsibility chain of http interceptables, so when processXXXInterception is called on first interceptor,
         * all http interceptables are called in a row
         * Note: the array of interceptors are wired in Ng2Modules
         *
        */
        if (interceptors.length > 0) {
            interceptors.reduce((chain, current) => {
                chain.successor = current;
                return current;
            });

            this.firstInterceptor = interceptors[0];
        }
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.request(url, this.getRequestOptionArgs(options)));
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.get(url, this.getRequestOptionArgs(options));
    }

    post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.post(url, body, this.getRequestOptionArgs(options));
    }

    put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.put(url, body, this.getRequestOptionArgs(options));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.delete(url, this.getRequestOptionArgs(options));
    }

    getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }

        return !this.firstInterceptor ? options : this.firstInterceptor.processRequestInterception(options);
    }

    intercept(observable: Observable<Response>): Observable<Response> {
        return !this.firstInterceptor ? observable : this.firstInterceptor.processResponseInterception(observable);
    }
    /* TODO, implement logic for all interceptors in similar fashion as AuthInterceptor
    interceptByPass(observable: Observable<Response>): Observable<Response> {
        observable.forEach(element => {
            var alertKey: String = element.headers.get('X-interceptorApp-alert');
            // AlertService.success(alertKey, { param: response.headers('X-interceptorApp-params')});
        });

        return observable.catch((err, source) => {
            console.log(err);
            if (err.status  == 401 ) {
                return Observable.throw(err);
            } else if (!(err.status === 401 && (err._body === '' || (err._body.path && err._body.path.indexOf('/api/account') === 0 )))) {
                return Observable.throw(err);
            } else {
                return Observable.throw(err);
            }
        });

    }
    */
}
