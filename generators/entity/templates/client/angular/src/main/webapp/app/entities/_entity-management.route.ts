<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
<%_
const i18nToLoad = [entityInstance];
for (const idx in fields) {
    if (fields[idx].fieldIsEnum === true) {
        i18nToLoad.push(fields[idx].enumInstance);
    }
}
_%>
<%_
let hasDate = false;
if (fieldsContainInstant || fieldsContainZonedDateTime || fieldsContainLocalDate) {
    hasDate = true;
}
_%>
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService, AuthoritiesConstants, Principal } from '../../shared';
import { JhiPaginationUtil } from 'ng-jhipster';

import { <%= entityAngularName %>Component } from './<%= entityFileName %>.component';
import { <%= entityAngularName %>DetailComponent } from './<%= entityFileName %>-detail.component';
import { <%= entityAngularName %>PopupComponent } from './<%= entityFileName %>-dialog.component';
<%_ if (entityFileName.length <= 30) { _%>
import { <%= entityAngularName %>DeletePopupComponent } from './<%= entityFileName %>-delete-dialog.component';
<%_ } else { _%>
import {
    <%= entityAngularName %>DeletePopupComponent
} from './<%= entityFileName %>-delete-dialog.component';
<%_ } _%>

<%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
@Injectable()
export class <%= entityAngularName %>ResolvePagingParams implements Resolve<any> {

    constructor(private paginationUtil: JhiPaginationUtil) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const page = route.queryParams['page'] ? route.queryParams['page'] : '1';
        const sort = route.queryParams['sort'] ? route.queryParams['sort'] : 'id,asc';
        return {
            page: this.paginationUtil.parsePage(page),
            predicate: this.paginationUtil.parsePredicate(sort),
            ascending: this.paginationUtil.parseAscending(sort)
      };
    }
}

<%_ } _%>
export const <%= entityInstance %>Route: Routes = [
    {
        path: '<%= entityUrl %>',
        component: <%= entityAngularName %>Component,
        <%_ if (pagination === 'pagination' || pagination === 'pager'){ _%>
        resolve: {
            'pagingParams': <%= entityAngularName %>ResolvePagingParams
        },
        <%_ } _%>
        data: {
            authorities: [AuthoritiesConstants.USER],
            pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: '<%= entityUrl %>/:id',
        component: <%= entityAngularName %>DetailComponent,
        data: {
            authorities: [AuthoritiesConstants.USER],
            pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
        },
        canActivate: [UserRouteAccessService]
    }
];

export const <%= entityInstance %>PopupRoute: Routes = [
    {
        path: '<%= entityUrl %>-new',
        component: <%= entityAngularName %>PopupComponent,
        data: {
            authorities: [AuthoritiesConstants.USER],
            pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: '<%= entityUrl %>/:id/edit',
        component: <%= entityAngularName %>PopupComponent,
        data: {
            authorities: [AuthoritiesConstants.USER],
            pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: '<%= entityUrl %>/:id/delete',
        component: <%= entityAngularName %>DeletePopupComponent,
        data: {
            authorities: [AuthoritiesConstants.USER],
            pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
