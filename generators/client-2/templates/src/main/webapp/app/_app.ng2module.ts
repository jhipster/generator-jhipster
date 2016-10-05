import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UIRouterModule } from 'ui-router-ng2';
import { Ng1ToNg2Module } from 'ui-router-ng1-to-ng2';

import { <%=angular2AppName%>SharedModule, XSRFStrategyProvider } from './shared';
import { <%=angular2AppName%>CommonModule } from './components';
import { <%=angular2AppName%>AdminModule } from './admin/admin.ng2module'; //TODO these couldnt be used from barrels due to an error
import { <%=angular2AppName%>AccountModule } from './account/account.ng2module';

import { appState } from './app.state';
import { HomeComponent, homeState } from './home';
import { NavbarComponent, FooterComponent, <% if (enableTranslation){ %>ActiveMenuDirective, <% } %>ErrorComponent, errorState, accessdeniedState } from './layouts';

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
        <%=angular2AppName%>CommonModule,
        <%=angular2AppName%>AdminModule,
        <%=angular2AppName%>AccountModule
    ],
    declarations: [
        HomeComponent,
        NavbarComponent,
        ErrorComponent,
        FooterComponent<%_ if (enableTranslation){ _%>,
        ActiveMenuDirective
        <%_ } _%>
    ],
    providers: [
        XSRFStrategyProvider,
        { provide: Window, useValue: window },
        { provide: Document, useValue: document },
        { provide: JSON, useValue: JSON }
    ],
    bootstrap: [ HomeComponent ]
})
export class <%=angular2AppName%>AppModule {}
