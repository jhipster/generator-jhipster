import { XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { <%=angularAppName%>CommonModule } from './components/common.module';
import { <%=angularAppName%>AdminModule } from './admin/admin.module';

import {FindLanguageFromKeyPipe} from "./components/language/language.pipe";

@NgModule({
    imports: [BrowserModule, FormsModule, <%=angularAppName%>CommonModule, <%=angularAppName%>AdminModule],
    providers: [{
        provide: XSRFStrategy, useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
    }],
    declarations: [FindLanguageFromKeyPipe]
})
export class <%=angularAppName%>AppModule {}
