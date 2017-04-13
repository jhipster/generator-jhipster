<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { <%= angular2AppName %>SharedModule } from '../../shared';
<%_ for (const rel of differentRelationships) {
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

const ENTITY_STATES = [
    ...<%= entityInstance %>Route,
    ...<%= entityInstance %>PopupRoute,
];

@NgModule({
    imports: [
        <%= angular2AppName %>SharedModule,
        <%_ for (const rel of differentRelationships) {
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
