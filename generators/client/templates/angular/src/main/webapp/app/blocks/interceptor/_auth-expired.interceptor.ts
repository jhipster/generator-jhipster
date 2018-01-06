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
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { LoginService } from '../../shared/login/login.service';
    <%_ if (authenticationType === 'uaa') { _%>
import { LoginModalService } from '../../shared/login/login-modal.service';
import { Principal } from '../../shared/auth/principal.service';
import { Router } from '@angular/router';
    <%_ } _%>
<%_ } _%>
<%_ if (authenticationType === 'session' || authenticationType === 'oauth2') { _%>
    <%_ if (authenticationType === 'session') { _%>
import { AuthServerProvider } from '../../shared/auth/auth-session.service';
import { LoginModalService } from '../../shared/login/login-modal.service';
    <%_ } _%>
import { StateStorageService } from '../../shared/auth/state-storage.service';
<%_ } _%>

export class AuthExpiredInterceptor implements HttpInterceptor {

<%_ if (authenticationType === 'jwt') { _%>
    constructor(private loginService: LoginService) {
    }
<%_ } else if (authenticationType === 'uaa') { _%>
    constructor(
        private loginService: LoginService,
        private loginModalService: LoginModalService,
        private principal: Principal,
        private router: Router) {
    }
<%_ } else if (authenticationType === 'session') { _%>
    constructor(
        private authServerProvider: AuthServerProvider,
        private stateStorageService: StateStorageService,
        private loginModalService: LoginModalService) {
    }
<%_ } else if (authenticationType === 'oauth2') { _%>
    constructor(
        private loginService: LoginService,
        private stateStorageService: StateStorageService) {
    }
<%_ } _%>

<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).do((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                // success
            }
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401) {
<%_ if (authenticationType === 'jwt') { _%>
                    this.loginService.logout();
<%_ } if (authenticationType === 'uaa') { _%>
                    if (this.principal.isAuthenticated()) {
                        this.principal.authenticate(null);
                        this.loginModalService.open();
                    } else {
                        this.loginService.logout();
                        this.router.navigate(['/']);
                    }
<%_ } _%>
                }
            }
        });
    }
<%_ } else if (authenticationType === 'session' || authenticationType === 'oauth2') { _%>
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).do((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                // success
            }
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401 && err.url && err.url.includes('/api/account')) {
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
                    this.authServerProvider.logout();
                    this.loginModalService.open();
                    <%_ } else { _%>
                    this.loginService.login();
                    <%_ } _%>
                }
            }
        });
    }
<%_ } _%>
}
