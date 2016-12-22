<%_
    var hasDate = false;
    if (fieldsContainZonedDateTime || fieldsContainLocalDate) {
        hasDate = true;
    }
_%>
import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
<%_ if(hasDate) { _%>
import { DateUtils } from '../../shared/service/date-util.service';
<%_ } _%>
@Injectable()
export class <%= entityClass %>Service {

    private resourceUrl: string = <% if (applicationType == 'gateway' && locals.microserviceName) {%> '<%= microserviceName.toLowerCase() %>/' +<% } %> 'api/<%= entityApiUrl %>';
    <%_ if(searchEngine === 'elasticsearch') { _%>
    private resourceSearchUrl: string = <% if (applicationType == 'gateway' && locals.microserviceName) {%> '<%= microserviceName.toLowerCase() %>/' +<% } %> 'api/_search/<%= entityApiUrl %>';
    <% _ } _%>

    constructor(private http: Http<% if (hasDate) { %>, private dateUtils: DateUtils<% } %>) { }

    create(<%= entityInstance %>: <%= entityClass %>): Observable<Response> {
        let copy = Object.assign({},<%= entityInstance %>);
        <% for (idx in fields) { if (fields[idx].fieldType == 'LocalDate') { %>copy.<%=fields[idx].fieldName%> = this.dateUtils.convertLocalDateToServer(this.dateUtils.toDate(<%= entityInstance %>.<%=fields[idx].fieldName%>));
        <% } }%>
        return this.http.post(this.resourceUrl, copy);
    }

    update(<%= entityInstance %>: <%= entityClass %>): Observable<Response> {
        let copy = Object.assign({},<%= entityInstance %>);
        <% for (idx in fields) { if (fields[idx].fieldType == 'LocalDate') { %>copy.<%=fields[idx].fieldName%> = this.dateUtils.convertLocalDateToServer(this.dateUtils.toDate(<%= entityInstance %>.<%=fields[idx].fieldName%>));
        <% } }%>
        return this.http.put(this.resourceUrl, copy);
    }

    find(id: number): Observable<<%= entityClass %>> {
        //TODO dateUtils.convertDateTimeFromServer
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            <%_ if(hasDate) { _%>
            let jsonResponse = res.json();
            <% for (idx in fields) { if (fields[idx].fieldType == 'LocalDate') { %>jsonResponse.<%=fields[idx].fieldName%> = this.dateUtils.convertLocalDateFromServer(jsonResponse.<%=fields[idx].fieldName%>);
            <% }}%>
            return jsonResponse;
            <%_ } else { _%>
                return res.json();
            <%_ } _%>
        });
    }

    query(req?: any): Observable<Response> {
        let options:any = {};
        if (req) {
            let params: URLSearchParams = new URLSearchParams();
            params.set('page', req.page);
            params.set('size', req.size);
            params.paramsMap.set('sort', req.sort);

            options.search = params;
        }
        //TODO Use Response class from @angular/http when the body field will be accessible directly
        return this.http.get(this.resourceUrl, options).map((res: any) => {
            <%_ if(hasDate) { _%>
            let jsonResponse = res.json();
            for(let i = 0; i < jsonResponse.length; i++){
            <% for (idx in fields) { if (fields[idx].fieldType == 'LocalDate') { %>    jsonResponse[i].<%=fields[idx].fieldName%> = this.dateUtils.convertLocalDateFromServer(jsonResponse[i].<%=fields[idx].fieldName%>);
            <% }}%>}
            res._body = jsonResponse;
            return res;
            <%_ } else { _%>
            return res;
            <%_ } _%>
        });
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
