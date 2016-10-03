import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UIRouterModule } from 'ui-router-ng2';
import { Ng1ToNg2Module } from 'ui-router-ng1-to-ng2';

import { <%=angular2AppName%>SharedModule } from './shared/shared.ng2module';
import { <%=angular2AppName%>CommonModule } from './components/common.ng2module';
import { <%=angular2AppName%>AdminModule } from './admin/admin.ng2module';
import { <%=angular2AppName%>AccountModule } from './account/account.ng2module';

import { XSRFStrategyProvider } from './shared/XSRF-strategy.provider';

import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { ErrorComponent } from './layouts/error/error.component';
<%_ if (enableTranslation){ _%>
import { ActiveMenuDirective } from './layouts/navbar/active-menu.directive';
<%_ } _%>

import { appState } from './app.state';
import { homeState } from './home/home.state';
import { errorState, accessdeniedState } from './layouts/error/error.state';

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
        XSRFStrategyProvider
    ],
    bootstrap: [ HomeComponent ]
})
export class <%=angular2AppName%>AppModule {}
