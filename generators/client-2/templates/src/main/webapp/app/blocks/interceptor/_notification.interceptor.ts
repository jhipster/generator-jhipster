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
                if(arr[i][0].endsWith('app-error') || arr[i][0].endsWith('app-params'))
                    headers.push(arr[i][0]);
            }
            if(headers.length >= 1)
                let alertKey = error.headers.get(headers[0]);
            if(typeof alertKey === 'string'){
                //AlertService.success(alertKey, { param : response.headers('X-<%=angularAppName%>-params')});
            }
            return Observable.throw(error);
        });
    }
}
