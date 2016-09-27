import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Ng1ToNg2Module } from "ui-router-ng1-to-ng2";

import { <%=angular2AppName%>SharedModule } from './shared/shared.ng2module';
import { <%=angular2AppName%>CommonModule } from './components/common.ng2module';
import { <%=angular2AppName%>AdminModule } from './admin/admin.ng2module';
import { <%=angular2AppName%>AccountModule } from './account/account.ng2module';

import { XSRFStrategyProvider } from './shared/XSRF-strategy.provider';

import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
<%_ if (enableTranslation){ _%>
import { ActiveMenuDirective } from './layouts/navbar/active-menu.directive';
<%_ } _%>

@NgModule({
    imports: [
        BrowserModule,
        Ng1ToNg2Module,
        <%=angular2AppName%>SharedModule,
        <%=angular2AppName%>CommonModule,
        <%=angular2AppName%>AdminModule,
        <%=angular2AppName%>AccountModule
    ],
    declarations: [
        HomeComponent,
        NavbarComponent,
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
