import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [],
    exports: [
        FormsModule,
        HttpModule,
        CommonModule,
        NgbModule
    ]
})
export class <%=angular2AppName%>SharedLibsModule {}
