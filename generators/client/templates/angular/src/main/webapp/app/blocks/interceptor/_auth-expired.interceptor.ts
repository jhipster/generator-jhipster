<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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
import { Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
<%_ if (['oauth2', 'jwt', 'uaa'].includes(authenticationType)) { _%>
    <%_ if (authenticationType === 'uaa') { _%>
import { Router } from '@angular/router';
import { LoginModalService } from '../../shared/login/login-modal.service';
import { Principal } from '../../shared/auth/principal.service';
    <%_ } _%>
import { LoginService } from '../../shared/login/login.service';
<%_ } _%>
<%_ if (['session', 'oauth2'].includes(authenticationType)) { _%>
    <%_ if (authenticationType === 'session') { _%>
import { AuthServerProvider } from '../../shared/auth/auth-session.service';
import { LoginModalService } from '../../shared/login/login-modal.service';
    <%_ } _%>
import { StateStorageService } from '../../shared/auth/state-storage.service';
<%_ } _%>

export class AuthExpiredInterceptor implements HttpInterceptor {

    constructor(
        <%_ if (['session', 'oauth2'].includes(authenticationType)) { _%>
        private stateStorageService: StateStorageService,
        <%_ } _%>
        private injector: Injector
    ) {}

<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).do((event: HttpEvent<any>) => {}, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401) {
<%_ if (authenticationType === 'jwt') { _%>
                    const loginService: LoginService = this.injector.get(LoginService);
                    loginService.logout();
<% } if (authenticationType === 'uaa') { %>
                    const principal = this.injector.get(Principal);

                    if (principal.isAuthenticated()) {
                        principal.authenticate(null);
                        const loginModalService: LoginModalService = this.injector.get(LoginModalService);
                        loginModalService.open();
                    } else {
                        const loginService: LoginService = this.injector.get(LoginService);
                        loginService.logout();
                        const router = this.injector.get(Router);
                        router.navigate(['/']);
                    }
<%_ } _%>
                }
            }
        });
    }
<%_ } else if (authenticationType === 'session' || authenticationType === 'oauth2') { _%>
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).do((event: HttpEvent<any>) => {}, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401 && err.url && !err.url.includes('/api/account')) {
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
<% if (authenticationType === 'session') { %>
                    const authServer: AuthServerProvider = this.injector.get(AuthServerProvider);
                    authServer.logout();
                    const loginModalService: LoginModalService = this.injector.get(LoginModalService);
                    loginModalService.open();
<% } else { %>
                    const loginService: LoginService = this.injector.get(LoginService);
                    loginService.login();
<% } %>
                }
            }
        });
    }
<%_ } _%>
}
