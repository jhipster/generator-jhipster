import { HttpInterceptable } from './http.interceptable';
import { RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

export class NotificationInterceptor extends HttpInterceptable {

    constructor() {
        super();
    }

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        return <Observable<Response>> observable.catch((error) => {
            let arr = Array.from(error.headers._headers);
            let headers = [];
            let i;
            for(i = 0; i < arr.length; i++){
                if(arr[i][0].indexOf('app-alert', arr[i][0].length - 'app-alert'.length) !== -1 ||
                    arr[i][0].indexOf('app-params', arr[i][0].length - 'app-params'.length) !== -1) {
                    headers.push(arr[i][0]);
                }
            }
            headers.sort();
            let alertKey = headers.length >= 1 ? error.headers.get(headers[0]) : null;
            if(typeof alertKey === 'string'){
                //AlertService.sucnpm linkcess(alertKey, { param : response.headers(headers[1])});
            }
            return Observable.throw(error);
        });
    }
}
