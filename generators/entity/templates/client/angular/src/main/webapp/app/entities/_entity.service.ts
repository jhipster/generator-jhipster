<%_ var hasDate = false;
    if (fieldsContainZonedDateTime || fieldsContainLocalDate) {
        hasDate = true;
    }
_%>
import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
@Injectable()
export class <%= entityClass %>Service {
    constructor(private http: Http<% if (hasDate) { %>, dateUtils: DateUtils<% } %>) { }

    private resourceUrl: string = <% if (applicationType == 'gateway' && locals.microserviceName) {%> '<%= microserviceName.toLowerCase() %>/' +<% } %> 'api/<%= entityApiUrl %>';
    <%_ if(searchEngine === 'elasticsearch') { _%>
    private resourceSearchUrl: string = <% if (applicationType == 'gateway' && locals.microserviceName) {%> '<%= microserviceName.toLowerCase() %>/' +<% } %> 'api/_search/<%= entityApiUrl %>';
    <% _ } _%>

    create(entity:<%= entityClass %>): Observable<Response> {
        //TODO dateUtils.convertLocalDateToServer when any filed has date
        return this.http.post(resourceUrl, entity);
    }

    update(entity:<%= entityClass %>): Observable<Response> {
        //TODO dateUtils.convertLocalDateToServer when any filed has date
        return this.http.put(resourceUrl, entity);
    }

    find(id:string): Observable<<%= entityClass %>> {
        //TODO dateUtils.convertLocalDateFromServer & dateUtils.convertDateTimeFromServer
        return this.http.get(`${resourceUrl}/${id}`).map((res: Response) => res.json());
    }

    query(req: any): Observable<Response> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('page', req.page);
        params.set('size', req.size);
        params.set('sort', req.sort);

        let options = {
            search: params
        };

        return this.http.get(resourceUrl, options);
    }

    delete(id:string): Observable<Response> {
        return this.http.delete(`${resourceUrl}/${login}`);
    }

    <%_ if(searchEngine === 'elasticsearch') { _%>
    search(id: string): Observable<Response> {
        return this.http.get(`${resourceSearchUrl}/${id}`).map((res: Response) => res.json());
    }
    <% _ } _%>
}
