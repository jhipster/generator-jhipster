import { XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { <%=angularAppName%>CommonModule } from './components/common.ng2module';
import { <%=angularAppName%>AdminModule } from './admin/admin.ng2module';
import { <%=angularAppName%>AccountModule } from './account/account.ng2module';

import { FindLanguageFromKeyPipe } from './components/language/language.pipe';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        <%=angularAppName%>CommonModule,
        <%=angularAppName%>AdminModule,
        <%=angularAppName%>AccountModule
    ],
    declarations: [
        HomeComponent,
        NavbarComponent,
        FindLanguageFromKeyPipe
    ],
    providers: [{
        provide: XSRFStrategy, useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
    }],
    bootstrap: [ HomeComponent ]
})
export class <%=angularAppName%>AppModule {}
