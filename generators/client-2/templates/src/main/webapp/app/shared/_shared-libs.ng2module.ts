import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

// TODO change this to NgbModule -->  after complete migration
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap/alert/alert.module';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap/collapse/collapse.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap/dropdown/dropdown.module';

@NgModule({
    imports: [],
    exports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        CommonModule,
        NgbAlertModule,
        NgbCollapseModule,
        NgbDropdownModule
    ]
})
export class <%=angular2AppName%>SharedLibsModule {}
