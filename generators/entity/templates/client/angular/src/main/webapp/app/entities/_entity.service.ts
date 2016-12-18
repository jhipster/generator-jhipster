import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { <%= entityClass %> } from './<%= entityFileName %>.model';

@Injectable()
export class <%= entityClass %>Service {
    constructor(private http: Http) { }

    create(<%= entityInstance %>: <%= entityClass %>): Observable<Response> {
        return this.http.post(<% if(authenticationType === 'uaa') { %>`<%= uaaBaseName.toLowerCase() %>/api/<%= entityApiUrl %>`<%} else { %>`api/<%= entityApiUrl %>`<% } %>, <%= entityInstance %>);
    }

    update(<%= entityInstance %>: <%= entityClass %>): Observable<Response> {
        return this.http.put(<% if(authenticationType === 'uaa') { %>`<%= uaaBaseName.toLowerCase() %>/api/<%= entityApiUrl %>`<%} else { %>`api/<%= entityApiUrl %>`<% } %>, <%= entityInstance %>);
    }

    find(id: number): Observable<<%= entityClass %>> {
        return this.http.get(<% if(authenticationType === 'uaa') { %>`<%= uaaBaseName.toLowerCase() %>/api/<%= entityApiUrl %>/${id}`<%} else { %>`api/<%= entityApiUrl %>/${id}`<% } %>).map((res: Response) => res.json());
    }

    query(req: any): Observable<Response> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('page', req.page);
        params.set('size', req.size);
        params.paramsMap.set('sort', req.sort);

        let options = {
            search: params
        };

        return this.http.get('api/<%= entityApiUrl %>', options);
    }

    delete(id: number): Observable<Response> {
        return this.http.delete(<% if(authenticationType === 'uaa') { %>`<%= uaaBaseName.toLowerCase() %>/api/<%= entityApiUrl %>/${id}`<%} else { %>`api/<%= entityApiUrl %>/${id}`<% } %>);
    }
}
