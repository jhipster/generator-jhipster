import { NgModule } from '@angular/core';

import { <%=angular2AppName%>SharedModule } from '../shared/shared.ng2module';

import { AlertService } from "./alert/alert.service";
import { ProfileService } from './profiles/profile.service';
import { PageRibbonComponent } from './profiles/page-ribbon.component';
import { jhiAlertComponent } from "./alert/alert.component";

@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule
    ],
    declarations: [
        jhiAlertComponent,
        PageRibbonComponent
    ],
    providers: [
        AlertService,
        ProfileService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class <%=angular2AppName%>CommonModule {}
