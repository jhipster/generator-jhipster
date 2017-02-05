import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { <%= angular2AppName %>SharedModule } from '../../shared';
<%_ for (var rel of differentRelationships) {
       if (rel.otherEntityNameCapitalized === 'User') { _%>
import { <%= angular2AppName %>AdminModule } from '../../admin/admin.module';
<%_ }} _%>

import {
    <%= entityAngularJSName %>Service,
    <%= entityAngularJSName %>PopupService,
    <%= entityAngularJSName %>Component,
    <%= entityAngularJSName %>DetailComponent,
    <%= entityAngularJSName %>DialogComponent,
    <%= entityAngularJSName %>PopupComponent,
    <%= entityAngularJSName %>DeletePopupComponent,
    <%= entityAngularJSName %>DeleteDialogComponent,
    <%= entityInstance %>Route,
    <%= entityInstance %>PopupRoute,
    <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
    <%= entityAngularJSName %>ResolvePagingParams,
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
        <%= entityAngularJSName %>Component,
        <%= entityAngularJSName %>DetailComponent,
        <%= entityAngularJSName %>DialogComponent,
        <%= entityAngularJSName %>DeleteDialogComponent,
        <%= entityAngularJSName %>PopupComponent,
        <%= entityAngularJSName %>DeletePopupComponent,
    ],
    entryComponents: [
        <%= entityAngularJSName %>Component,
        <%= entityAngularJSName %>DialogComponent,
        <%= entityAngularJSName %>PopupComponent,
        <%= entityAngularJSName %>DeleteDialogComponent,
        <%= entityAngularJSName %>DeletePopupComponent,
    ],
    providers: [
        <%= entityAngularJSName %>Service,
        <%= entityAngularJSName %>PopupService,
        <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
        <%= entityAngularJSName %>ResolvePagingParams,
        <%_ } _%>
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class <%= angular2AppName %><%= entityAngularJSName %>Module {}
