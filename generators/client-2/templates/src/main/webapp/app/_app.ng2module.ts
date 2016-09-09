import { HttpModule, XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// TODO change this to NgbModule -->  after complete migration
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap/collapse/collapse.module';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap/dropdown/dropdown.module';

import { <%=angular2AppName%>CommonModule } from './components/common.ng2module';
import { <%=angular2AppName%>AdminModule } from './admin/admin.ng2module';
import { <%=angular2AppName%>AccountModule } from './account/account.ng2module';

import { FindLanguageFromKeyPipe } from './components/language/language.pipe';
import { CapitalizePipe } from './components/util/capitalize.pipe';
import { FilterPipe } from "./shared/filter.pipe";
import { OrderByPipe } from "./shared/order-by.pipe";
import { TranslatePipe } from './shared/translate.pipe';

import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        NgbCollapseModule,
        NgbDropdownModule,
        <%=angular2AppName%>CommonModule,
        <%=angular2AppName%>AdminModule,
        //<%=angular2AppName%>AccountModule
    ],
    declarations: [
        HomeComponent,
        NavbarComponent,
        FindLanguageFromKeyPipe,
        CapitalizePipe,
        //FilterPipe,
        //OrderByPipe,
        //TranslatePipe
    ],
    providers: [
        {
            provide: XSRFStrategy,
            useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
        }
    ],
    bootstrap: [ HomeComponent ]
})
export class <%=angular2AppName%>AppModule {}
