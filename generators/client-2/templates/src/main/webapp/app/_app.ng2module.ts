import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UIRouterModule } from 'ui-router-ng2';
import { Ng1ToNg2Module } from 'ui-router-ng1-to-ng2';

import { <%=angular2AppName%>SharedModule, XSRFStrategyProvider } from './shared';
import { <%=angular2AppName%>AdminModule } from './admin/admin.ng2module'; //TODO these couldnt be used from barrels due to an error
import { <%=angular2AppName%>AccountModule } from './account/account.ng2module';

import { appState } from './app.state';
import { HomeComponent, homeState } from './home';
import {
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

let routerConfig = {
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
        Ng1ToNg2Module,
        UIRouterModule.forChild(routerConfig),
        <%=angular2AppName%>SharedModule,
        <%=angular2AppName%>AdminModule,
        <%=angular2AppName%>AccountModule
    ],
    declarations: [
        HomeComponent,
        NavbarComponent,
        ErrorComponent,
        PageRibbonComponent,
        FooterComponent<% if (enableTranslation){ %>,
        ActiveMenuDirective<% } %>
    ],
    providers: [
        ProfileService,
        XSRFStrategyProvider,
        { provide: Window, useValue: window },
        { provide: Document, useValue: document }
    ],
    bootstrap: [ HomeComponent ]
})
export class <%=angular2AppName%>AppModule {}
