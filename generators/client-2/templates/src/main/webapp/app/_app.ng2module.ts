import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UIRouterModule, RootModule } from 'ui-router-ng2';
import { Ng2Webstorage } from 'ng2-webstorage';

import { <%=angular2AppName%>SharedModule } from './shared';
import { <%=angular2AppName%>AdminModule } from './admin/admin.ng2module'; //TODO these couldnt be used from barrels due to an error
import { <%=angular2AppName%>AccountModule } from './account/account.ng2module';

import { appState } from './app.state';
import { HomeComponent, homeState } from './home';
import { JHipsterRouterConfig } from "./router.config";
import {
    JHipsterMainComponent,
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

localStorageConfig();

let routerConfig = {
    configClass: JHipsterRouterConfig,
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
        JHipsterMainComponent,
        HomeComponent,
        NavbarComponent,
        ErrorComponent,
        PageRibbonComponent,
        FooterComponent<% if (enableTranslation){ %>,
        ActiveMenuDirective<% } %>
    ],
    providers: [
        ProfileService,
        { provide: Window, useValue: window },
        { provide: Document, useValue: document }
    ],
    bootstrap: [ JHipsterMainComponent ]
})
export class <%=angular2AppName%>AppModule {}
