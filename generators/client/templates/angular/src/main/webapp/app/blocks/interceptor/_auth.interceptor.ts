<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
import { Observable } from 'rxjs/Observable';
import { RequestOptionsArgs, Response } from '@angular/http';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { JhiHttpInterceptor } from 'ng-jhipster';

export class AuthInterceptor extends JhiHttpInterceptor {

    constructor(
        private localStorage: LocalStorageService,
        private sessionStorage: SessionStorageService
    ) {
        super();
    }

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        const token = this.localStorage.retrieve('authenticationToken') || this.sessionStorage.retrieve('authenticationToken');
        <%_ if (authenticationType === 'oauth2') { _%>
        if (token && token.expires_at && token.expires_at > new Date().getTime()) {
            options.headers.append('Authorization', 'Bearer ' + token.access_token);
        }
        <%_ } else if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
        if (!!token) {
            options.headers.append('Authorization', 'Bearer ' + token);
        }
        <%_ } _%>
        return options;
    }

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        return observable; // by pass
    }

}
