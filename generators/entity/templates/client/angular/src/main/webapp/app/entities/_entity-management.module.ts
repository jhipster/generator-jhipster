import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { <%= angular2AppName %>SharedModule } from '../../shared';
<%_ for (var rel of differentRelationships) {
       if (rel.otherEntityNameCapitalized === 'User') { _%>
import { <%= angular2AppName %>AdminModule } from '../../admin/admin.module';
<%_ }} _%>

import {
    <%= entityClass %>Service,
    <%= entityClass %>PopupService,
    <%= entityClass %>Component,
    <%= entityClass %>DetailComponent,
    <%= entityClass %>DialogComponent,
    <%= entityClass %>PopupComponent,
    <%= entityClass %>DeletePopupComponent,
    <%= entityClass %>DeleteDialogComponent,
    <%= entityInstance %>Route,
    <%= entityInstance %>PopupRoute,
    <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
    <%= entityClass %>ResolvePagingParams,
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
        <%= entityClass %>Component,
        <%= entityClass %>DetailComponent,
        <%= entityClass %>DialogComponent,
        <%= entityClass %>DeleteDialogComponent,
        <%= entityClass %>PopupComponent,
        <%= entityClass %>DeletePopupComponent,
    ],
    entryComponents: [
        <%= entityClass %>Component,
        <%= entityClass %>DialogComponent,
        <%= entityClass %>PopupComponent,
        <%= entityClass %>DeleteDialogComponent,
        <%= entityClass %>DeletePopupComponent,
    ],
    providers: [
        <%= entityClass %>Service,
        <%= entityClass %>PopupService,
        <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
        <%= entityClass %>ResolvePagingParams,
        <%_ } _%>
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%= angular2AppName %><%= entityClass %>Module {}
