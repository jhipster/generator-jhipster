import { Injector } from '@angular/core';
import { Http, XHRBackend, RequestOptions } from '@angular/http';
import { EventManager, InterceptableHttp } from 'ng-jhipster';

<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthInterceptor } from './auth.interceptor';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
<%_ } if (authenticationType === 'session') { _%>
import { StateStorageService } from '../../shared/auth/state-storage.service';
<%_ } _%>
import { AuthExpiredInterceptor } from './auth-expired.interceptor';
import { ErrorHandlerInterceptor } from './errorhandler.interceptor';
import { NotificationInterceptor } from './notification.interceptor';

export const customHttpProvider = () => ({
    provide: Http,
    useFactory: (
        backend: XHRBackend,
        defaultOptions: RequestOptions,
        <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
        localStorage: LocalStorageService,
        sessionStorage: SessionStorageService,
        injector: Injector,
        <%_ } if (authenticationType === 'session') { _%>
        injector: Injector,
        stateStorageService: StateStorageService,
        <%_ } _%>
        eventManager: EventManager
    ) => new InterceptableHttp(
        backend,
        defaultOptions,
        [
        <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
            new AuthInterceptor(localStorage, sessionStorage),
            new AuthExpiredInterceptor(injector),
        <%_ } if (authenticationType === 'session') { _%>
            new AuthExpiredInterceptor(injector, stateStorageService),
        <%_ } _%>
            // Other interceptors can be added here
            new ErrorHandlerInterceptor(eventManager),
            new NotificationInterceptor()
        ]
    ),
    deps: [
        XHRBackend,
        RequestOptions,
        <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
        LocalStorageService,
        SessionStorageService,
        Injector,
        <%_ } if (authenticationType === 'session') { _%>
        Injector,
        StateStorageService,
        <%_ } _%>
        EventManager
    ]
});
