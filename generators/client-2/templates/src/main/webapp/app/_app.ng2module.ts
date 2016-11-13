<%_ if(authenticationType === 'uaa') { _%>
import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
<%_ } %>
import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UIRouterModule, RootModule } from 'ui-router-ng2';
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { Ng2Webstorage, LocalStorageService, SessionStorageService } from 'ng2-webstorage';
<%_ } if(authenticationType === 'session') { _%>
import { Ng2Webstorage } from 'ng2-webstorage';
<% } %>

import { <%=angular2AppName%>SharedModule } from './shared';
import { <%=angular2AppName%>AdminModule } from './admin/admin.ng2module'; //TODO these couldnt be used from barrels due to an error
import { <%=angular2AppName%>AccountModule } from './account/account.ng2module';

import { appState } from './app.state';
import { HomeComponent, homeState } from './home';
import { <%=jhiPrefixCapitalized%>RouterConfig } from './blocks/config/router.config';
import {
    <%=jhiPrefixCapitalized%>MainComponent,
    NavbarComponent,
    FooterComponent,
    ProfileService,
    PageRibbonComponent,
    <%_ if (enableTranslation){ _%>
    ActiveMenuDirective,
    <%_ } _%>
    ErrorComponent,
    errorState,
    accessdeniedState
} from './layouts';
import { localStorageConfig } from './blocks/config/localstorage.config';
import { HttpInterceptor } from './blocks/interceptor/http.interceptor';
import {AuthExpiredInterceptor} from "./blocks/interceptor/auth-expired.interceptor";
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import {Http, XHRBackend, RequestOptions} from "@angular/http";
<%_ } if(authenticationType === 'session') { _%>
import { StateStorageService } from "./shared/auth/state-storage.service";
<% } %>



localStorageConfig();

let routerConfig = {
    configClass: <%=jhiPrefixCapitalized%>RouterConfig,
    otherwise: '/',
    states: [
        appState,
        homeState,
        errorState,
        accessdeniedState
    ]
};

@NgModule({
    imports: [
        BrowserModule,
        UIRouterModule.forRoot(routerConfig),
        Ng2Webstorage,
        <%=angular2AppName%>SharedModule,
        <%=angular2AppName%>AdminModule,
        <%=angular2AppName%>AccountModule
    ],
    declarations: [
        <%=jhiPrefixCapitalized%>MainComponent,
        HomeComponent,
        NavbarComponent,
        ErrorComponent,
        PageRibbonComponent,
        <%_ if (enableTranslation){ _%>
        ActiveMenuDirective,
        <%_ } _%>
        FooterComponent
    ],
    providers: [
        ProfileService,
        { provide: Window, useValue: window },
        { provide: Document, useValue: document },
        {
            provide: Http,
            useFactory: (
                backend: XHRBackend,
                defaultOptions: RequestOptions,
                <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
                localStorage : LocalStorageService,
                sessionStorage : SessionStorageService,
                injector
                <%_ } if (authenticationType === 'session') { _%>
                injector
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
                    //other intecetpors can be added here
                ]
            ),
            deps: [
                XHRBackend,
                RequestOptions,
                Injector,
                <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
                LocalStorageService,
                SessionStorageService
                <%_ } if (authenticationType === 'session') { _%>
                StateStorageService
                <%_ } _%>
            ]
        }
    ],
    bootstrap: [ <%=jhiPrefixCapitalized%>MainComponent ]
})
export class <%=angular2AppName%>AppModule {}
