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
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

import { User } from './user.model';
import { createRequestOption } from '../model/request-util';

@Injectable()
export class UserService {
    private resourceUrl = '<% if (authenticationType === 'uaa') { %><%= uaaBaseName.toLowerCase() %>/<% } %>api/users';

    constructor(private http: HttpClient) { }

    create(user: User): Observable<HttpResponse<User>> {
        return this.http.post<User>(this.resourceUrl, user, { observe: 'response' });
    }

    update(user: User): Observable<HttpResponse<User>> {
        return this.http.put<HttpResponse<User>>(this.resourceUrl, user);
    }

    find(login: string): Observable<User> {
        return this.http.get(`${this.resourceUrl}/${login}`);
    }

    query(req?: any): Observable<HttpResponse<User[]>> {
        const options = createRequestOption(req);
        return this.http.get<User[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(login: string): Observable<HttpResponse<any>> {
        return this.http.delete(`${this.resourceUrl}/${login}`, { observe: 'response' });
    }

    authorities(): Observable<string[]> {
<%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
        return this.http.get<string[]>('<% if (authenticationType === 'uaa') { %><%= uaaBaseName.toLowerCase() %>/<% } %>api/users/authorities');
<%_ } else { _%>
        return Observable.of(['ROLE_USER', 'ROLE_ADMIN']);
<%_ } _%>
    }
}
