import { XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FilterPipe } from "../shared/filter.pipe";
import { OrderByPipe } from "../shared/order-by.pipe";
import { TranslatePipe } from '../shared/translate.pipe';

@NgModule({
    imports: [BrowserModule, FormsModule],
    declarations: [
        FilterPipe,
        OrderByPipe,
        TranslatePipe
    ],
    providers: [
        {
            provide: XSRFStrategy,
            useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
        }
    ]
})
export class <%=angular2AppName%>AccountModule {}
