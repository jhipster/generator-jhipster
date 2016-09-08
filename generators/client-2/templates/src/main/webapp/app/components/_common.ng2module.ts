import { NgModule } from '@angular/core';

import { ProfileService } from './profiles/profile.service';
import { PageRibbonComponent } from './profiles/page-ribbon.component';
import { TruncateCharactersPipe } from './util/truncate-characters.pipe';
import { TruncateWordsPipe } from './util/truncate-words.pipe';

@NgModule({
    imports: [],
    declarations: [
        PageRibbonComponent,
        TruncateCharactersPipe,
        TruncateWordsPipe
    ],
    providers: [
        ProfileService
    ]
})
export class <%=angular2AppName%>CommonModule {}
