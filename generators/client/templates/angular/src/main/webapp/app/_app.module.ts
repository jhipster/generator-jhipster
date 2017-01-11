<%_ if (authenticationType === 'uaa') { _%>
import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
<%_ } %>
import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { Ng2Webstorage } from 'ng2-webstorage';

import { <%=angular2AppName%>SharedModule } from './shared';
import { <%=angular2AppName%>AdminModule } from './admin/admin.module';
import { <%=angular2AppName%>EntityModule } from './entities/entity.module';
import { <%=angular2AppName%>AccountModule } from './account/account.module';

import { appState, AuthorizeResolve } from './app.state';
import { HomeComponent, homeRoute } from './home';
import { <%=jhiPrefixCapitalized%>RouterConfig } from './blocks/config/router.config';
import { customHttpProvider } from './blocks/interceptor/http.provider';
import { PaginationConfig } from './blocks/config/uib-pagination.config';

import {
    <%=jhiPrefixCapitalized%>MainComponent,
    NavbarComponent,
    FooterComponent,
    ProfileService,
    PageRibbonComponent,
    <%_ if (enableTranslation) { _%>
    ActiveMenuDirective,
    <%_ } _%>
    ErrorComponent,
    errorRoute
} from './layouts';

let BASE_ROUTES = [
   ...homeRoute,
   ...navbarRoute,
   ...errorRoute
];


@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(BASE_ROUTES, { useHash: true })
        Ng2Webstorage.forRoot({ prefix: 'jhi'}),
        <%=angular2AppName%>SharedModule,
        <%=angular2AppName%>AdminModule,
        <%=angular2AppName%>EntityModule,
        <%=angular2AppName%>AccountModule
    ],
    declarations: [
        <%=jhiPrefixCapitalized%>MainComponent,
        HomeComponent,
        NavbarComponent,
        ErrorComponent,
        PageRibbonComponent,
        <%_ if (enableTranslation) { _%>
        ActiveMenuDirective,
        <%_ } _%>
        FooterComponent
    ],
    providers: [
        ProfileService,
        { provide: Window, useValue: window },
        { provide: Document, useValue: document },
        customHttpProvider(),
        PaginationConfig,
        AuthorizeResolve
    ],
    bootstrap: [ <%=jhiPrefixCapitalized%>MainComponent ]
})
export class <%=angular2AppName%>AppModule {}
