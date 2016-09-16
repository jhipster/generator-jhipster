import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';


import { <%=angular2AppName%>SharedModule } from '../shared/shared.ng2module';

import { AlertService } from "./alert/alert.service";
import { ProfileService } from './profiles/profile.service';
import { PageRibbonComponent } from './profiles/page-ribbon.component';
import { jhiAlertComponent } from "./alert/alert.component";

@NgModule({
    imports: [
        CommonModule,
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
