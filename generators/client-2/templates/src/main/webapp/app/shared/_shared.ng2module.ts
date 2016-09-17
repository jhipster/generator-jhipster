import { NgModule } from '@angular/core';

import { <%=angular2AppName%>SharedLibsModule } from './shared-libs.ng2module';

import { TruncateCharactersPipe } from './pipe/truncate-characters.pipe';
import { TruncateWordsPipe } from './pipe/truncate-words.pipe';
import { CapitalizePipe } from './pipe/capitalize.pipe';
import { FilterPipe } from './pipe/filter.pipe';
import { OrderByPipe } from './pipe/order-by.pipe';
import { TranslatePipe } from './pipe/translate.pipe';

import { JhiItemCountComponent } from './component/jhi-item-count.component';
import { MaxbytesValidator } from './directive/maxbytes.directive';
import { MinbytesValidator } from './directive/minbytes.directive';
import { ShowValidationDirective } from './directive/show-validation.directive';

@NgModule({
    imports: [<%=angular2AppName%>SharedLibsModule],
    declarations: [
        TruncateCharactersPipe,
        TruncateWordsPipe,
        OrderByPipe,
        FilterPipe,
        TranslatePipe,
        CapitalizePipe,
        JhiItemCountComponent,
        MaxbytesValidator,
        MinbytesValidator,
        ShowValidationDirective
    ],
    providers: [
    ],
    exports: [
        <%=angular2AppName%>SharedLibsModule,
        TruncateCharactersPipe,
        TruncateWordsPipe,
        OrderByPipe,
        FilterPipe,
        TranslatePipe,
        CapitalizePipe,
        JhiItemCountComponent,
        MaxbytesValidator,
        MinbytesValidator,
        ShowValidationDirective
    ]
})
export class <%=angular2AppName%>SharedModule {}
