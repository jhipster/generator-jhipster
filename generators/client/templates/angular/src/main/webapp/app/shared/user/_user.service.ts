<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
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
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { User } from './user.model';

@Injectable()
export class UserService {
    private resourceUrl = '<% if (authenticationType === 'uaa') { %><%= uaaBaseName.toLowerCase() %>/<% } %>api/users';

    constructor(private http: Http) { }

    create(user: User): Observable<Response> {
        return this.http.post(this.resourceUrl, user);
    }

    update(user: User): Observable<Response> {
        return this.http.put(this.resourceUrl, user);
    }

    find(login: string): Observable<User> {
        return this.http.get(`${this.resourceUrl}/${login}`).map((res: Response) => res.json());
    }

    query(req?: any): Observable<Response> {
        const params: URLSearchParams = new URLSearchParams();
        if (req) {
            params.set('page', req.page);
            params.set('size', req.size);
            if (req.sort) {
                params.paramsMap.set('sort', req.sort);
            }
        }

        const options = {
            search: params
        };

        return this.http.get(this.resourceUrl, options);
    }

    delete(login: string): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${login}`);
    }

    authorities(): Observable<string[]> {
<%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>
        return this.http.get('api/users/authorities').map((res: Response) => {
            const json = res.json();
            return <string[]> json;
        });
<%_ } else { _%>
        return Observable.of(['ROLE_USER', 'ROLE_ADMIN']);
<%_ } _%>
    }

}
