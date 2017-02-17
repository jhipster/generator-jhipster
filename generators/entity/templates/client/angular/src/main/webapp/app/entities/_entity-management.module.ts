import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { <%= angular2AppName %>SharedModule } from '../../shared';
<%_ for (var rel of differentRelationships) {
       if (rel.otherEntityNameCapitalized === 'User') { _%>
import { <%= angular2AppName %>AdminModule } from '../../admin/admin.module';
<%_ }} _%>

import {
    <%= entityAngularName %>Service,
    <%= entityAngularName %>PopupService,
    <%= entityAngularName %>Component,
    <%= entityAngularName %>DetailComponent,
    <%= entityAngularName %>DialogComponent,
    <%= entityAngularName %>PopupComponent,
    <%= entityAngularName %>DeletePopupComponent,
    <%= entityAngularName %>DeleteDialogComponent,
    <%= entityInstance %>Route,
    <%= entityInstance %>PopupRoute,
    <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
    <%= entityAngularName %>ResolvePagingParams,
    <%_ } _%>
} from './';

let ENTITY_STATES = [
    ...<%= entityInstance %>Route,
    ...<%= entityInstance %>PopupRoute,
];

@NgModule({
    imports: [
        <%= angular2AppName %>SharedModule,
        <%_ for (var rel of differentRelationships) {
              if (rel.otherEntityNameCapitalized === 'User') { _%>
        <%= angular2AppName %>AdminModule,
        <%_ }} _%>
        RouterModule.forRoot(ENTITY_STATES, { useHash: true })
    ],
    declarations: [
        <%= entityAngularName %>Component,
        <%= entityAngularName %>DetailComponent,
        <%= entityAngularName %>DialogComponent,
        <%= entityAngularName %>DeleteDialogComponent,
        <%= entityAngularName %>PopupComponent,
        <%= entityAngularName %>DeletePopupComponent,
    ],
    entryComponents: [
        <%= entityAngularName %>Component,
        <%= entityAngularName %>DialogComponent,
        <%= entityAngularName %>PopupComponent,
        <%= entityAngularName %>DeleteDialogComponent,
        <%= entityAngularName %>DeletePopupComponent,
    ],
    providers: [
        <%= entityAngularName %>Service,
        <%= entityAngularName %>PopupService,
        <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
        <%= entityAngularName %>ResolvePagingParams,
        <%_ } _%>
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%= angular2AppName %><%= entityAngularName %>Module {}
