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
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class AccountService  {
    constructor(private http: Http) { }

    get(): Observable<any> {
        return this.http.get(<% if (authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account'<%} else { %>'api/account'<% } %>).map((res: Response) => res.json());
    }

    save(account: any): Observable<Response> {
        return this.http.post(<% if (authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account'<%} else { %>'api/account'<% } %>, account);
    }
}
