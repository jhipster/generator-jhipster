import {Injectable} from '@angular/core';
import {Http, ConnectionBackend, RequestOptions, RequestOptionsArgs, Request, Response, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import { AuthServerProvider } from '../../shared/auth/auth-session.service';

@Injectable()
export class CustomHttp extends Http {

 constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, private auth: AuthServerProvider <%_ if (authenticationType === 'oauth') { _%>, private principal: Principal <%_ } _%> ) {
        super(backend, defaultOptions);
    }
 
    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.request(url, options));
    }
 
    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.get(url,options));
    }
 
    post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {   
        return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
    }
 
    put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
    }
 
    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.delete(url, options));
    }
    
    getRequestOptionArgs(options?: RequestOptionsArgs) : RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }
        options.headers.append('Content-Type', 'application/json');
        return options;
    }
 
    intercept(observable: Observable<Response>): Observable<Response> {
        observable.forEach(element => {
            var alertKey: String = element.headers.get('X-interceptorApp-alert');
            // AlertService.success(alertKey, { param : response.headers('X-interceptorApp-params')}); 
        });

        return observable.catch((err, source) => {
            console.log(err);
            if (err.status  == 401 ) {
                <%_ if (authenticationType === 'oauth') { _%> 
                    if (this.rincipal.isAuthenticated()) {
                        this.auth.authorize(true);
                    }
                <%_ } if (authenticationType === 'session') { _%> 
                if ( err._body.path && err._body.path.indexOf('/api/account') === -1 ){
                    this.auth.logout();
                }
                <%_ } _%>
                return Observable.throw(err);
            } else if (!(err.status === 401 && (err._body === '' || (err._body.path && err._body.path.indexOf('/api/account') === 0 )))) {
                return Observable.throw(err);
            } else {
                return Observable.throw(err);
            }
        });
 
    }
}