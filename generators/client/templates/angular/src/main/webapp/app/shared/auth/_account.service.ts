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
<%_ if (authenticationType === 'oauth2') { _%>
import {OAuthService} from 'angular-oauth2-oidc';
import {Account} from '../user/account.model';
<%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>
import { Http, Response } from '@angular/http';
<%_ } _%>
import { Observable } from 'rxjs/Rx';
<%_ if (authenticationType !== 'uaa' || authenticationType !== 'oauth2') { _%>
import { SERVER_API_URL } from '../../app.constants';
<%_ } _%>

@Injectable()
export class AccountService  {
    <%_ if (authenticationType === 'oauth2') { _%>
    constructor(private oauthService: OAuthService) { }
    <%_ } else  { _%>
    constructor(private http: Http) { }
    <%_ } _%>

    <%_ if (authenticationType === 'oauth2') { _%>
    get(): Observable<Account> {
        return Observable.fromPromise(this.oauthService.loadUserProfile().then((account: any) => {
            return new Account(
                account.email_verified,
                account.roles,
                account.email,
                account.given_name,
                account.lang_key,
                account.family_name,
                account.preferred_username,
                account.image_url
            );
        }));
    }
    <%_ } else { _%>
    get(): Observable<any> {
        return this.http.get(<% if (authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/<% } else { %>SERVER_API_URL + '<% } %>api/account').map((res: Response) => res.json());
    }
    <%_ } _%>

    <%_ if (authenticationType !== 'oauth2') { _%>
    save(account: any): Observable<Response> {
        return this.http.post(<% if (authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/<% } else { %>SERVER_API_URL + '<% } %>api/account', account);
    }
    <%_ } _%>
}
