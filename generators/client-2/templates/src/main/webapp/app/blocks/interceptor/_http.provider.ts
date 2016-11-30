import { Injector } from '@angular/core';
import { Http, XHRBackend, RequestOptions } from '@angular/http';
import { HttpInterceptor } from './http.interceptor';
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthInterceptor } from './auth.interceptor';
<%_ } if(authenticationType === 'session') { _%>
import { StateStorageService } from '../../shared/auth/state-storage.service';
<%_ } _%>
import { AuthExpiredInterceptor } from './auth-expired.interceptor';

export const customHttpProvider = () => ({
    provide: Http,
    useFactory: (
        backend: XHRBackend,
        defaultOptions: RequestOptions,
        <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
        localStorage : LocalStorageService,
        sessionStorage : SessionStorageService,
        injector: Injector
        <%_ } if (authenticationType === 'session') { _%>
        injector: Injector,
        stateStorageService: StateStorageService
        <%_ } _%>
    ) => new HttpInterceptor(
        backend,
        defaultOptions,
        [
        <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
            new AuthInterceptor(localStorage, sessionStorage),
            new AuthExpiredInterceptor(injector)
        <%_ } if (authenticationType === 'session') { _%>
            new AuthExpiredInterceptor(injector, injector.get("$rootScope"), stateStorageService)
        <%_ } _%>
            //other interceptors can be added here
        ]
    ),
    deps: [
        XHRBackend,
        RequestOptions,
        <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
        LocalStorageService,
        SessionStorageService,
        Injector
        <%_ } if (authenticationType === 'session') { _%>
        Injector,
        StateStorageService
        <%_ } _%>
    ]
});
