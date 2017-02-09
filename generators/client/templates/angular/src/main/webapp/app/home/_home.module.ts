import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ParseLinks } from 'ng-jhipster';

import { <%=angular2AppName%>SharedModule } from '../shared';

import { HOME_ROUTES, HomeComponent } from './';


@NgModule({
    imports: [
        <%=angular2AppName%>SharedModule,
        RouterModule.forRoot(HOME_ROUTES, { useHash: true })
    ],
    declarations: [
        HomeComponent,
    ],
    entryComponents: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%=angular2AppName%>HomeModule {}
