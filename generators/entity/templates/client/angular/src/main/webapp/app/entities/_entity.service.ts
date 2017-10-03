<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
<%_
    let hasDate = false;
    if (fieldsContainInstant || fieldsContainZonedDateTime || fieldsContainLocalDate) {
        hasDate = true;
    }
_%>
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
<%_ if (!(applicationType === 'gateway' && locals.microserviceName) && authenticationType !== 'uaa') { _%>
import { SERVER_API_URL } from '../../app.constants';
<%_ } _%>
<%_ if (hasDate) { _%>

import { JhiDateUtils } from 'ng-jhipster';
<%_ } _%>

import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class <%= entityAngularName %>Service {

    private resourceUrl = <% if (applicationType === 'gateway' && locals.microserviceName) { %>'/<%= microserviceName.toLowerCase() %>/<% } else if (authenticationType === 'uaa') { %>'<% } else { %>SERVER_API_URL + '<% } %>api/<%= entityApiUrl %>';
    <%_ if(searchEngine === 'elasticsearch') { _%>
    private resourceSearchUrl = <% if (applicationType === 'gateway' && locals.microserviceName) { %>'/<%= microserviceName.toLowerCase() %>/<% } else if (authenticationType === 'uaa') { %>'<% } else { %>SERVER_API_URL + '<% } %>api/_search/<%= entityApiUrl %>';
    <%_ } _%>

    constructor(private http: Http<% if (hasDate) { %>, private dateUtils: JhiDateUtils<% } %>) { }
    <%_ if (entityAngularName.length <= 30) { _%>

    create(<%= entityInstance %>: <%= entityAngularName %>): Observable<<%= entityAngularName %>> {
    <%_ } else { _%>

    create(<%= entityInstance %>: <%= entityAngularName %>):
        Observable<<%= entityAngularName %>> {
    <%_ } _%>
        const copy = this.convert(<%= entityInstance %>);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }
    <%_ if (entityAngularName.length <= 30) { _%>

    update(<%= entityInstance %>: <%= entityAngularName %>): Observable<<%= entityAngularName %>> {
    <%_ } else { _%>

    update(<%= entityInstance %>: <%= entityAngularName %>):
        Observable<<%= entityAngularName %>> {
    <%_ } _%>
        const copy = this.convert(<%= entityInstance %>);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: <% if (pkType === 'String') { %>string<% } else { %>number<% } %>): Observable<<%= entityAngularName %>> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    query(req?: any): Observable<ResponseWrapper> {
        const options = createRequestOption(req);
        return this.http.get(this.resourceUrl, options)
            .map((res: Response) => this.convertResponse(res));
    }

    delete(id: <% if (pkType === 'String') { %>string<% } else { %>number<% } %>): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
    }
    <%_ if(searchEngine === 'elasticsearch') { _%>

    search(req?: any): Observable<ResponseWrapper> {
        const options = createRequestOption(req);
        return this.http.get(this.resourceSearchUrl, options)
            .map((res: any) => this.convertResponse(res));
    }
    <%_ } _%>

    private convertResponse(res: Response): ResponseWrapper {
        const jsonResponse = res.json();
        const result = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            result.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return new ResponseWrapper(res.headers, result, res.status);
    }

    /**
     * Convert a returned JSON object to <%= entityAngularName %>.
     */
    private convertItemFromServer(json: any): <%= entityAngularName %> {
        const entity: <%= entityAngularName %> = Object.assign(new <%= entityAngularName %>(), json);
        <%_ for (idx in fields) { _%>
            <%_ if (fields[idx].fieldType === 'LocalDate') { _%>
        entity.<%=fields[idx].fieldName%> = this.dateUtils
            .convertLocalDateFromServer(json.<%=fields[idx].fieldName%>);
            <%_ } _%>
            <%_ if (['Instant', 'ZonedDateTime'].includes(fields[idx].fieldType)) { _%>
        entity.<%=fields[idx].fieldName%> = this.dateUtils
            .convertDateTimeFromServer(json.<%=fields[idx].fieldName%>);
            <%_ } _%>
        <%_ } _%>
        return entity;
    }

    /**
     * Convert a <%= entityAngularName %> to a JSON which can be sent to the server.
     */
    private convert(<%= entityInstance %>: <%= entityAngularName %>): <%= entityAngularName %> {
        const copy: <%= entityAngularName %> = Object.assign({}, <%= entityInstance %>);
        <%_ for (idx in fields){ if (fields[idx].fieldType === 'LocalDate') { _%>
        copy.<%=fields[idx].fieldName%> = this.dateUtils
            .convertLocalDateToServer(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } if (['Instant', 'ZonedDateTime'].includes(fields[idx].fieldType)) { %>
        copy.<%=fields[idx].fieldName%> = this.dateUtils.toDate(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } } _%>
        return copy;
    }
}
