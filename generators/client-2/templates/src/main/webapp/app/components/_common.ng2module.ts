import { XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ProfileService } from './profiles/profile.service';

@NgModule({
    imports: [BrowserModule, FormsModule],
    providers: [
        ProfileService,
        {
            provide: XSRFStrategy,
            useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
        }
    ],
    declarations: []
})
export class <%=angularAppName%>CommonModule {}
