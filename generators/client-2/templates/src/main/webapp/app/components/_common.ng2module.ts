import { NgModule } from '@angular/core';

import { <%=angular2AppName%>SharedModule } from '../shared/shared.ng2module';

import { ProfileService } from './profiles/profile.service';
import { PageRibbonComponent } from './profiles/page-ribbon.component';

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule
    ],
    declarations: [
        PageRibbonComponent
    ],
    providers: [
        ProfileService
    ]
})
export class <%=angular2AppName%>CommonModule {}
