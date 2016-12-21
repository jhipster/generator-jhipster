<%_
    var hasDate = false;
    if (fieldsContainZonedDateTime || fieldsContainLocalDate) {
        hasDate = true;
    }
_%>
import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
<% if (hasDate) { %>import { DateUtils } from "../../shared/service/date-util.service";<% } %>

import { <%= entityClass %> } from './<%= entityFileName %>.model';

@Injectable()
export class <%= entityClass %>Service {

    private resourceUrl: string = <% if (applicationType == 'gateway' && locals.microserviceName) {%> '<%= microserviceName.toLowerCase() %>/' +<% } %> 'api/<%= entityApiUrl %>';
    <%_ if(searchEngine === 'elasticsearch') { _%>
    private resourceSearchUrl: string = <% if (applicationType == 'gateway' && locals.microserviceName) {%> '<%= microserviceName.toLowerCase() %>/' +<% } %> 'api/_search/<%= entityApiUrl %>';
    <% _ } _%>

    constructor(private http: Http<% if (hasDate) { %>, dateUtils: DateUtils<% } %>) { }

    create(<%= entityInstance %>: <%= entityClass %>): Observable<Response> {
        //TODO dateUtils.convertLocalDateToServer when any filed has date
        return this.http.post(this.resourceUrl, <%= entityInstance %>);
    }

    update(<%= entityInstance %>: <%= entityClass %>): Observable<Response> {
        //TODO dateUtils.convertLocalDateToServer when any filed has date
        return this.http.put(this.resourceUrl, <%= entityInstance %>);
    }

    find(id: number): Observable<<%= entityClass %>> {
        //TODO dateUtils.convertLocalDateFromServer & dateUtils.convertDateTimeFromServer
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => res.json());
    }

    query(req?: any): Observable<Response> {
        let params: URLSearchParams = new URLSearchParams();
        if(req) {
            params.set('page', req.page);
            params.set('size', req.size);
            if(req.sort){
                params.paramsMap.set('sort', req.sort);
            }
            params.set('filter', req.filter);
        }

        let options = {
            search: params
        };

        return this.http.get(this.resourceUrl, options);
    }

    delete(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
    }

    <%_ if(searchEngine === 'elasticsearch') { _%>
    search(query: string): Observable<Response> {
        return this.http.get(`${this.resourceSearchUrl}/${query}`).map((res: Response) => res.json());
    }
    <% _ } _%>
}
