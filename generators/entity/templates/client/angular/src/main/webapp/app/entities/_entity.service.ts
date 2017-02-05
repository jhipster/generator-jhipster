<%_
    var hasDate = false;
    if (fieldsContainZonedDateTime || fieldsContainLocalDate) {
        hasDate = true;
    }
_%>
import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, BaseRequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
<%_ if(hasDate) { _%>
import { DateUtils } from 'ng-jhipster';
<%_ } _%>
@Injectable()
export class <%= entityAngularName %>Service {

    private resourceUrl = '<% if (applicationType == 'gateway' && locals.microserviceName) { %><%= microserviceName.toLowerCase() %>/<% } %>api/<%= entityApiUrl %>';
    <%_ if(searchEngine === 'elasticsearch') { _%>
    private resourceSearchUrl = '<% if (applicationType == 'gateway' && locals.microserviceName) { %><%= microserviceName.toLowerCase() %>/<% } %>api/_search/<%= entityApiUrl %>';
    <%_ } _%>

    constructor(private http: Http<% if (hasDate) { %>, private dateUtils: DateUtils<% } %>) { }

    <%_ if (entityAngularName.length <= 30) { _%>
    create(<%= entityInstance %>: <%= entityAngularName %>): Observable<<%= entityAngularName %>> {
    <%_ } else { _%>
    create(<%= entityInstance %>: <%= entityAngularName %>):
        Observable<<%= entityAngularName %>> {

    <%_ } _%>
        let copy: <%= entityAngularName %> = Object.assign({}, <%= entityInstance %>);
        <%_ for (idx in fields){ if (fields[idx].fieldType == 'LocalDate') { _%>
        copy.<%=fields[idx].fieldName%> = this.dateUtils
            .convertLocalDateToServer(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } if (fields[idx].fieldType == 'ZonedDateTime') { _%>
        copy.<%=fields[idx].fieldName%> = this.dateUtils.toDate(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } } _%>
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            return res.json();
        });
    }

    <%_ if (entityAngularName.length <= 30) { _%>
    update(<%= entityInstance %>: <%= entityAngularName %>): Observable<<%= entityAngularName %>> {
    <%_ } else { _%>
    update(<%= entityInstance %>: <%= entityAngularName %>):
        Observable<<%= entityAngularName %>> {

    <%_ } _%>
        let copy: <%= entityAngularName %> = Object.assign({}, <%= entityInstance %>);
        <%_ for (idx in fields){ if (fields[idx].fieldType == 'LocalDate') { _%>
        copy.<%=fields[idx].fieldName%> = this.dateUtils
            .convertLocalDateToServer(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } if (fields[idx].fieldType == 'ZonedDateTime') { %>
        copy.<%=fields[idx].fieldName%> = this.dateUtils.toDate(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } } _%>
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            return res.json();
        });
    }

    find(id: number): Observable<<%= entityAngularName %>> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            <%_ if(hasDate) { _%>
            let jsonResponse = res.json();
            <%_ for (idx in fields){ if (fields[idx].fieldType == 'LocalDate') { _%>
            jsonResponse.<%=fields[idx].fieldName%> = this.dateUtils
                .convertLocalDateFromServer(jsonResponse.<%=fields[idx].fieldName%>);
            <%_ } _%>
            <%_ if (fields[idx].fieldType == 'ZonedDateTime') { _%>
            jsonResponse.<%=fields[idx].fieldName%> = this.dateUtils
                .convertDateTimeFromServer(jsonResponse.<%=fields[idx].fieldName%>);
            <%_ } } _%>
            return jsonResponse;
            <%_ } else { _%>
            return res.json();
            <%_ } _%>
        });
    }

    query(req?: any): Observable<Response> {
        let options = this.createRequestOption(req);
        <%_ // TODO Use Response class from @angular/http when the body field will be accessible  directly _%>
        return this.http.get(this.resourceUrl, options)
            <%_ if(hasDate) { _%>
            .map((res: any) => this.convertResponse(res))
            <%_ } _%>
        ;
    }

    delete(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
    }

    <%_ if(searchEngine === 'elasticsearch') { _%>
    search(req?: any): Observable<Response> {
        let options = this.createRequestOption(req);
        return this.http.get(this.resourceSearchUrl, options)
            <%_ if(hasDate) { _%>
            .map((res: any) => this.convertResponse(res))
            <%_ } _%>
        ;
    }
    <%_ } _%>

    <%_ if(hasDate) { _%>
    private convertResponse(res: any): any {
        let jsonResponse = res.json();
        for (let i = 0; i < jsonResponse.length; i++) {
        <%_ for (idx in fields) { _%>
            <%_ if (fields[idx].fieldType == 'LocalDate') { _%>
            jsonResponse[i].<%=fields[idx].fieldName%> = this.dateUtils
                .convertLocalDateFromServer(jsonResponse[i].<%=fields[idx].fieldName%>);
            <%_ } _%>
            <%_ if (fields[idx].fieldType == 'ZonedDateTime') { _%>
            jsonResponse[i].<%=fields[idx].fieldName%> = this.dateUtils
                .convertDateTimeFromServer(jsonResponse[i].<%=fields[idx].fieldName%>);
            <%_ } _%>
        <%_ } _%>
        }
        res._body = jsonResponse;
        return res;
    }
    <%_ } _%>

    private createRequestOption(req?: any): BaseRequestOptions {
        let options: BaseRequestOptions = new BaseRequestOptions();
        if (req) {
            let params: URLSearchParams = new URLSearchParams();
            params.set('page', req.page);
            params.set('size', req.size);
            if (req.sort) {
                params.paramsMap.set('sort', req.sort);
            }
            params.set('query', req.query);

            options.search = params;
        }
        return options;
    }
}
