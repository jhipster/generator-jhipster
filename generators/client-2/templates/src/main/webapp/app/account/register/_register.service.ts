import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';


@Injectable()
export class Register {

    constructor (private http: Http) {}

    save(account: any): Observable<any> {
        return this.http.post(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/register'<%} else { %>'api/register'<% } %>, account).map((res: Response) => res.json());
    }
}
