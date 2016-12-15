<%_ if(authenticationType === 'uaa') { _%>
import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
<%_ } %>
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UIRouterModule } from 'ui-router-ng2';
import { Ng2Webstorage } from 'ng2-webstorage';

import { <%=angular2AppName%>SharedModule } from './shared';
import { <%=angular2AppName%>AdminModule } from './admin/admin.module'; //TODO these couldn't be used from barrels due to an error
import { <%=angular2AppName%>AccountModule } from './account/account.module';

import { appState } from './app.state';
import { HomeComponent, homeState } from './home';
import { <%=jhiPrefixCapitalized%>RouterConfig } from './blocks/config/router.config';
import { localStorageConfig } from './blocks/config/localstorage.config';
import { customHttpProvider } from './blocks/interceptor/http.provider';

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

localStorageConfig();

let routerConfig = {
    configClass: <%=jhiPrefixCapitalized%>RouterConfig,
    useHash: true,
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
        customHttpProvider()
    ],
    bootstrap: [ <%=jhiPrefixCapitalized%>MainComponent ]
})
export class <%=angular2AppName%>AppModule {}
