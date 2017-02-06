import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ParseLinks } from 'ng-jhipster';

import { ParattSharedModule } from '../shared';

import { HOME_ROUTES, HomeComponent } from './';


@NgModule({
    imports: [
        ParattSharedModule,
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
