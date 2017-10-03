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
import { JhiHttpInterceptor } from 'ng-jhipster';
import { Injector } from '@angular/core';
import { RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { LoginService } from '../../shared/login/login.service';
    <%_ if (authenticationType === 'uaa') { _%>
import { Router } from '@angular/router';
    <%_ } _%>
<%_ } _%>
<%_ if (authenticationType === 'session' || authenticationType === 'oauth2') { _%>
import { AuthServerProvider } from '../../shared/auth/auth-session.service';
import { StateStorageService } from '../../shared/auth/state-storage.service';
    <%_ if (authenticationType === 'session') { _%>
import { LoginModalService } from '../../shared/login/login-modal.service';
    <%_ } _%>
<%_ } _%>

export class AuthExpiredInterceptor extends JhiHttpInterceptor {

<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    constructor(private injector: Injector) {
        super();
    }
<%_ } else if (authenticationType === 'session') { _%>
    constructor(
        private injector: Injector,
        private stateStorageService: StateStorageService,
        private loginServiceModal: LoginModalService) {
        super();
    }
<%_ } else if (authenticationType === 'oauth2') { _%>
    constructor(private injector: Injector,
        private stateStorageService: StateStorageService) {
        super();
    }
<%_ } _%>

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }
<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        return <Observable<Response>> observable.catch((error, source) => {
            if (error.status === 401) {
                const loginService: LoginService = this.injector.get(LoginService);
                loginService.logout();
<%_ if (authenticationType === 'uaa') { _%>
                const router = this.injector.get(Router);
                router.navigate(['/']);
<%_ } _%>
            }
            return Observable.throw(error);
        });
    }
<%_ } else if (authenticationType === 'session' || authenticationType === 'oauth2') { _%>

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        return <Observable<Response>> observable.catch((error) => {
            if (error.status === 401 && error.text() !== '' && error.json().path && error.json().path.indexOf('/api/account') === -1) {
                const destination = this.stateStorageService.getDestinationState();
                if (destination !== null) {
                    const to = destination.destination;
                    const toParams = destination.params;
                    if (to.name === 'accessdenied') {
                        this.stateStorageService.storePreviousState(to.name, toParams);
                    }
                } else {
                    this.stateStorageService.storeUrl('/');
                }
                <%_ if (authenticationType === 'session') { _%>
                const authServer: AuthServerProvider = this.injector.get(AuthServerProvider);
                authServer.logout();
                this.loginServiceModal.open();
                <%_ } else { _%>
                const loginService: LoginService = this.injector.get(LoginService);
                loginService.login();
                <%_ } _%>
            }
            return Observable.throw(error);
        });
    }
<%_ } _%>
}
