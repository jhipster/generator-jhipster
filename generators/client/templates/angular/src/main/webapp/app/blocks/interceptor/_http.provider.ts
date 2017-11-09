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
import { JhiEventManager, JhiInterceptableHttp } from 'ng-jhipster';
import { Injector } from '@angular/core';
import { Http, XHRBackend, RequestOptions } from '@angular/http';

<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    <%_ if (authenticationType !== 'uaa') { _%>
import { AuthInterceptor } from './auth.interceptor';
    <%_ } _%>
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
<%_ } _%>
<%_ if (authenticationType === 'session' || authenticationType === 'oauth2') { _%>
    <%_ if (authenticationType === 'session') { _%>
import { AuthServerProvider } from '../../shared/auth/auth-session.service';
import { LoginModalService } from '../../shared/login/login-modal.service';
    <%_ } _%>
import { StateStorageService } from '../../shared/auth/state-storage.service';
<%_ } _%>
import { AuthExpiredInterceptor } from './auth-expired.interceptor';
import { ErrorHandlerInterceptor } from './errorhandler.interceptor';
import { NotificationInterceptor } from './notification.interceptor';

export function interceptableFactory(
    backend: XHRBackend,
    defaultOptions: RequestOptions,
    <%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    localStorage: LocalStorageService,
    sessionStorage: SessionStorageService,
    injector: Injector,
    <%_ } else if (authenticationType === 'session') { _%>
    injector: Injector,
    stateStorageService: StateStorageService,
    loginServiceModal: LoginModalService,
    <%_ } else if (authenticationType === 'oauth2') { _%>
    injector: Injector,
    stateStorageService: StateStorageService,
    <%_ } _%>
    eventManager: JhiEventManager
) {
    return new JhiInterceptableHttp(
        backend,
        defaultOptions,
        [
        <%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
            <%_ if (authenticationType !== 'uaa') { _%>
            new AuthInterceptor(localStorage, sessionStorage),
            <%_ } _%>
            new AuthExpiredInterceptor(injector),
        <%_ } else if (authenticationType === 'session') { _%>
            new AuthExpiredInterceptor(injector, stateStorageService,
                loginServiceModal),
        <%_ } else if (authenticationType === 'oauth2') { _%>
        new AuthExpiredInterceptor(injector, stateStorageService),
        <%_ } _%>
            // Other interceptors can be added here
            new ErrorHandlerInterceptor(eventManager),
            new NotificationInterceptor(injector)
        ]
    );
}

export function customHttpProvider() {
    return {
        provide: Http,
        useFactory: interceptableFactory,
        deps: [
            XHRBackend,
            RequestOptions,
            <%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
            LocalStorageService,
            SessionStorageService,
            Injector,
            <%_ } else if (authenticationType === 'session' || authenticationType === 'oauth2') { _%>
            Injector,
            StateStorageService,
                <%_ if (authenticationType === 'session') { _%>
            LoginModalService,
                <%_ } _%>
            <%_ } _%>
            JhiEventManager
        ]
    };
}
