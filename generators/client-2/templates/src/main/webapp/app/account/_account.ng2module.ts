import { XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [BrowserModule, FormsModule],
    declarations: [

    ],
    providers: [
        {
            provide: XSRFStrategy,
            useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
        }
    ]
})
export class <%=angular2AppName%>AccountModule {}
