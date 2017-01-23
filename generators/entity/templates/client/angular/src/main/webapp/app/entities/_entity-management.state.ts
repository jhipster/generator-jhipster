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
      let page = route.params['page'] ? route.params['page'] : '1';
      let sort = route.params['sort'] ? route.params['sort'] : 'id,asc';
      return {
          page: this.paginationUtil.parsePage(page),
          predicate: this.paginationUtil.parsePredicate(sort),
          ascending: this.paginationUtil.parseAscending(sort)
    };
  }
}

export const <%= entityInstance %>Route: Routes = [
  {
    path: '<%= entityUrl %>',
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
    path: '<%= entityUrl %>-new',
    component: <%= entityAngularJSName %>PopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
    },
    outlet: 'popup'
  },
  {
    path: '<%= entityUrl %>/:id/edit',
    component: <%= entityAngularJSName %>PopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
    },
    outlet: 'popup'
  },
  {
    path: '<%= entityUrl %>/:id/delete',
    component: <%= entityAngularJSName %>DeletePopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
    },
    outlet: 'popup'
  }
];
