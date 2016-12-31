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
        let copy = Object.assign({}, <%= entityInstance %>);
        <%_ for (idx in fields){ if (fields[idx].fieldType == 'LocalDate') { _%>
        copy.<%=fields[idx].fieldName%> = this.dateUtils.convertLocalDateToServer(this.dateUtils.toDate(<%= entityInstance %>.<%=fields[idx].fieldName%>));
        <%_ } if (fields[idx].fieldType == 'ZonedDateTime') { _%>
        copy.<%=fields[idx].fieldName%> = this.dateUtils.toDate(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } } _%>
        return this.http.post(this.resourceUrl, copy);
    }

    update(<%= entityInstance %>: <%= entityClass %>): Observable<Response> {
        let copy = Object.assign({},<%= entityInstance %>);
        <%_ for (idx in fields){ if (fields[idx].fieldType == 'LocalDate') { _%>
        copy.<%=fields[idx].fieldName%> = this.dateUtils.convertLocalDateToServer(this.dateUtils.toDate(<%= entityInstance %>.<%=fields[idx].fieldName%>));<% }%><% if (fields[idx].fieldType == 'ZonedDateTime') { %>
        copy.<%=fields[idx].fieldName%> = this.dateUtils.toDate(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } } _%>
        return this.http.put(this.resourceUrl, copy);
    }

    find(id: number): Observable<<%= entityClass %>> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            <%_ if(hasDate) { _%>
            let jsonResponse = res.json();
            <%_ for (idx in fields){ if (fields[idx].fieldType == 'LocalDate') { _%>
            jsonResponse.<%=fields[idx].fieldName%> = this.dateUtils.convertLocalDateFromServer(jsonResponse.<%=fields[idx].fieldName%>);<% }%><% if (fields[idx].fieldType == 'ZonedDateTime') { %>
            jsonResponse.<%=fields[idx].fieldName%> = this.dateUtils.convertDateTimeFromServer(jsonResponse.<%=fields[idx].fieldName%>);<% } }%>
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
            if(req.sort){
                params.paramsMap.set('sort', req.sort);
            }
            params.set('filter', req.filter);

            options.search = params;
        }
        // TODO Use Response class from @angular/http when the body field will be accessible directly
        return this.http.get(this.resourceUrl, options).map((res: any) => {
            <%_ if(hasDate) { _%>
            let jsonResponse = res.json();
            for(let i = 0; i < jsonResponse.length; i++){
            <%_ for (idx in fields){ if (fields[idx].fieldType == 'LocalDate') { _%>
                jsonResponse[i].<%=fields[idx].fieldName%> = this.dateUtils.convertLocalDateFromServer(jsonResponse[i].<%=fields[idx].fieldName%>);
            <%_ } _%>
            <% if (fields[idx].fieldType == 'ZonedDateTime') { %>    jsonResponse[i].<%=fields[idx].fieldName%> = this.dateUtils.convertDateTimeFromServer(jsonResponse[i].<%=fields[idx].fieldName%>);
            <%_ } } _%>
            }
            res._body = jsonResponse;
            <%_ } _%>
            return res;
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
