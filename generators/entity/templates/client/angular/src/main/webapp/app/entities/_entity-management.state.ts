<%_
var i18nToLoad = [entityInstance];
for (var idx in fields) {
    if (fields[idx].fieldIsEnum == true) {
        i18nToLoad.push(fields[idx].enumInstance);
    }
}
_%>
<%_
var hasDate = false;
if (fieldsContainZonedDateTime || fieldsContainLocalDate) {
    hasDate = true;
}
_%>
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { PaginationUtil } from 'ng-jhipster';

import { <%= entityAngularJSName %>Component } from './<%= entityFileName %>.component';
import { <%= entityAngularJSName %>DetailComponent } from './<%= entityFileName %>-detail.component';
import { <%= entityAngularJSName %>PopupComponent } from './<%= entityFileName %>-dialog.component';
import { <%= entityAngularJSName %>DeletePopupComponent } from './<%= entityFileName %>-delete-dialog.component';

import { Principal } from '../../shared';

@Injectable()
export class <%= entityAngularJSName %>ResolvePagingParams implements Resolve<any> {

  constructor(private paginationUtil: PaginationUtil) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    return {
        page: this.paginationUtil.parsePage('1'),
        sort: 'asc',
        search: null,
        predicate: this.paginationUtil.parsePredicate('id,asc'),
        ascending: this.paginationUtil.parseAscending('id,asc')
    };
  }
}

export const <%= entityInstance %>Route: Routes = [
  {
    path: '<%= entityUrl %><% if (pagination == 'pagination' || pagination == 'pager') { %>?page&sort&search<% } %>',
    component: <%= entityAngularJSName %>Component,
    <%_ if (pagination == 'pagination' || pagination == 'pager'){ _%>
    resolve: {
      'pagingParams': <%= entityAngularJSName %>ResolvePagingParams
    },
    <%_ } _%>
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
    }
  }, {
    path: '<%= entityUrl %>/:id',
    component: <%= entityAngularJSName %>DetailComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
    }
  }
];

export const <%= entityInstance %>PopupRoute: Routes = [
  {
    path: '<%= entityInstance %>-new',
    component: <%= entityAngularJSName %>PopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
    },
    outlet: 'popup'
  },
  {
    path: '<%= entityInstance %>-edit/:id',
    component: <%= entityAngularJSName %>PopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
    },
    outlet: 'popup'
  },
  {
    path: '<%= entityInstance %>-delete/:id',
    component: <%= entityAngularJSName %>DeletePopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
    },
    outlet: 'popup'
  }
];
