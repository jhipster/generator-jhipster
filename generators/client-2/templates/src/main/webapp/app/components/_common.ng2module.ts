import { NgModule } from '@angular/core';

import { ProfileService } from './profiles/profile.service';
import { PageRibbonComponent } from './profiles/page-ribbon.component';

import { TruncateCharactersPipe } from '../shared/truncate-characters.pipe';
import { TruncateWordsPipe } from '../shared/truncate-words.pipe';
import { CapitalizePipe } from '../shared/capitalize.pipe';
import { FilterPipe } from '../shared/filter.pipe';
import { OrderByPipe } from '../shared/order-by.pipe';
import { TranslatePipe } from '../shared/translate.pipe';

@NgModule({
    imports: [],
    declarations: [
        PageRibbonComponent,
        TruncateCharactersPipe,
        TruncateWordsPipe,
        OrderByPipe,
        FilterPipe,
        TranslatePipe,
        CapitalizePipe
    ],
    providers: [
        ProfileService
    ],
    exports: [
        TruncateCharactersPipe,
        TruncateWordsPipe,
        OrderByPipe,
        FilterPipe,
        TranslatePipe,
        CapitalizePipe
    ]
})
export class <%=angular2AppName%>CommonModule {}
