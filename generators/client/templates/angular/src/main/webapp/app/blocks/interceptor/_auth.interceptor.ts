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
import { Observable } from 'rxjs/Observable';
import { RequestOptionsArgs, Response } from '@angular/http';
<%_ if (authenticationType === 'oauth2') { _%>
import { OAuthService } from 'angular-oauth2-oidc';
import { Injector } from '@angular/core';
<%_ } else { _%>
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
<%_ } _%>
import { JhiHttpInterceptor } from 'ng-jhipster';

export class AuthInterceptor extends JhiHttpInterceptor {

    <%_ if (authenticationType === 'oauth2') { _%>
    constructor(private injector: Injector) {
        super();
    }
    <%_ } else { _%>
    constructor(
        private localStorage: LocalStorageService,
        private sessionStorage: SessionStorageService
    ) {
        super();
    }
    <%_ } _%>

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (!options || !options.url || /^http/.test(options.url)) {
            return options;
        }

        <%_ if (authenticationType === 'oauth2') { _%>
        const oauthService: OAuthService = this.injector.get(OAuthService);
        const token = oauthService.getAccessToken();
        <%_ } else { _%>
        const token = this.localStorage.retrieve('authenticationToken') || this.sessionStorage.retrieve('authenticationToken');
        <%_ } _%>
        if (!!token) {
            options.headers.append('Authorization', 'Bearer ' + token);
        }
        return options;
    }

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        return observable; // by pass
    }

}
