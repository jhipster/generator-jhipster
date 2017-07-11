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
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { JhiPaginationUtil } from 'ng-jhipster';

import { UserMgmtComponent } from './user-management.component';
import { UserMgmtDetailComponent } from './user-management-detail.component';
import { UserDialogComponent } from './user-management-dialog.component';
import { UserDeleteDialogComponent } from './user-management-delete-dialog.component';

import { Principal, AuthoritiesConstants } from '../../shared';

@Injectable()
export class UserResolve implements CanActivate {

    constructor(private principal: Principal) { }

    canActivate() {
        return this.principal.identity().then((account) => this.principal.hasAnyAuthority([AuthoritiesConstants.ADMIN]));
    }
}

@Injectable()
export class UserResolvePagingParams implements Resolve<any> {

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

export const userMgmtRoute: Routes = [
    {
        path: 'user-management',
        component: UserMgmtComponent,
        resolve: {
            'pagingParams': UserResolvePagingParams
        },
        data: {
            pageTitle: 'userManagement.home.title'
        }
    },
    {
        path: 'user-management/:login',
        component: UserMgmtDetailComponent,
        data: {
            pageTitle: 'userManagement.home.title'
        }
    }
];

export const userDialogRoute: Routes = [
    {
        path: 'user-management-new',
        component: UserDialogComponent,
        outlet: 'popup'
    },
    {
        path: 'user-management/:login/edit',
        component: UserDialogComponent,
        outlet: 'popup'
    },
    {
        path: 'user-management/:login/delete',
        component: UserDeleteDialogComponent,
        outlet: 'popup'
    }
];
