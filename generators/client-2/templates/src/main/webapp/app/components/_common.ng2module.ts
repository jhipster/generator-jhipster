import { XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ProfileService } from './profiles/profile.service';
import { PageRibbonComponent } from './profiles/page-ribbon.component';
import { CapitalizePipe } from './util/capitalize.pipe';
import { TruncateCharactersPipe } from './util/truncate-characters.pipe';
import { TruncateWordsPipe } from './util/truncate-words.pipe';

@NgModule({
    imports: [BrowserModule, FormsModule],
    declarations: [
        PageRibbonComponent,
        CapitalizePipe,
        TruncateCharactersPipe,
        TruncateWordsPipe
    ],
    providers: [
        ProfileService,
        {
            provide: XSRFStrategy,
            useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
        }
    ]
})
export class <%=angular2AppName%>CommonModule {}
