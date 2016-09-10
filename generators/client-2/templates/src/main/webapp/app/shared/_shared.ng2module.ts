import { NgModule } from '@angular/core';

import { TruncateCharactersPipe } from './pipe/truncate-characters.pipe';
import { TruncateWordsPipe } from './pipe/truncate-words.pipe';
import { CapitalizePipe } from './pipe/capitalize.pipe';
import { FilterPipe } from './pipe/filter.pipe';
import { OrderByPipe } from './pipe/order-by.pipe';
import { TranslatePipe } from './pipe/translate.pipe';

@NgModule({
    imports: [],
    declarations: [
        TruncateCharactersPipe,
        TruncateWordsPipe,
        OrderByPipe,
        FilterPipe,
        TranslatePipe,
        CapitalizePipe
    ],
    providers: [
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
export class <%=angular2AppName%>SharedModule {}
