import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { Session } from './session.model';

@Injectable()
export class SessionsService {
    constructor(private http: Http) { }

    findAll(): Observable<Session[]> {
        return this.http.get(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account/sessions/'<%} else { %>'api/account/sessions/'<% } %>).map((res: Response) => res.json());
    }

    delete(series:string): Observable<Response> {
        return this.http.delete(<% if(authenticationType === 'uaa') { %>`<%= uaaBaseName.toLowerCase() %>/api/account/sessions/${series}`<%} else { %>`api/account/sessions/${series}`<% } %>);
    }
}
