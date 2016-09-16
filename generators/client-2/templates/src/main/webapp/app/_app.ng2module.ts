import { HttpModule, XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// TODO change this to NgbModule -->  after complete migration
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { <%=angular2AppName%>SharedModule } from './shared/shared.ng2module';
import { <%=angular2AppName%>CommonModule } from './components/common.ng2module';
import { <%=angular2AppName%>AdminModule } from './admin/admin.ng2module';
import { <%=angular2AppName%>AccountModule } from './account/account.ng2module';

import { FindLanguageFromKeyPipe } from './components/language/language.pipe';

import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        NgbModule,
        <%=angular2AppName%>SharedModule,
        <%=angular2AppName%>CommonModule,
        <%=angular2AppName%>AdminModule,
        <%=angular2AppName%>AccountModule
    ],
    declarations: [
        HomeComponent,
        NavbarComponent,
        FindLanguageFromKeyPipe
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
