import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

export interface AuditsData {
    timestamp : Date;
    principal : string;
    type: string;
    [name : string]: any;
}

@Injectable()
export class AuditsService  {
    constructor(private http: Http) { }
    query(): Observable<AuditsData[]> {
        return this.http.get(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/audits'<%} else { %>'management/jhipster/audits'<% } %>)
            .map((res: Response) => res.json());
    }
    get(id: string): Observable<AuditsData> {
        return this.http.get(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/audits/${id}'<%} else { %>'management/jhipster/audits/${id}'<% } %>)
            .map((res: Response) => res.json());
    }
}
