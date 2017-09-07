<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { JhiEventManager, JhiParseLinks, JhiPaginationUtil<% if (enableTranslation) { %>, JhiLanguageService<% } %>, JhiAlertService<% if (fieldsContainBlob) { %>, JhiDataUtils<% } %> } from 'ng-jhipster';

import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
import { <%= entityAngularName %>Service } from './<%= entityFileName %>.service';
import { ITEMS_PER_PAGE, Principal, ResponseWrapper } from '../../shared';
import { PaginationConfig } from '../../blocks/config/uib-pagination.config';

@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>',
    templateUrl: './<%= entityFileName %>.component.html'
})
export class <%= entityAngularName %>Component implements OnInit, OnDestroy {
    <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
<%- include('pagination-template', {toArrayString: toArrayString}); -%>
    <%_ } else if (pagination === 'infinite-scroll') { _%>
<%- include('infinite-scroll-template', {toArrayString: toArrayString}); -%>
    <%_ } else if (pagination === 'no') { _%>
<%- include('no-pagination-template', {toArrayString: toArrayString}); -%>
    <%_ } _%>
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeIn<%= entityClassPlural %>();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: <%= entityAngularName %>) {
        return item.id;
    }
    <%_ if (fieldsContainBlob) { _%>

    byteSize(field) {
        return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        return this.dataUtils.openFile(contentType, field);
    }
    <%_ } _%>
    <%_
    let eventCallBack = 'this.loadAll()';
    if (pagination === 'infinite-scroll') {
        eventCallBack = 'this.reset()';
    } _%>
    registerChangeIn<%= entityClassPlural %>() {
        this.eventSubscriber = this.eventManager.subscribe('<%= entityInstance %>ListModification', (response) => <%= eventCallBack %>);
    }

    <%_ if (pagination !== 'no') { _%>
        <%_ if (databaseType !== 'cassandra') { _%>
    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

        <%_ } _%>
        <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
    private onSuccess(data, headers) {
        <%_ if (databaseType !== 'cassandra') { _%>
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count');
        this.queryCount = this.totalItems;
        // this.page = pagingParams.page;
        <%_ } _%>
        this.<%= entityInstancePlural %> = data;
    }
        <%_ } else if (pagination === 'infinite-scroll') { _%>
    private onSuccess(data, headers) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count');
        for (let i = 0; i < data.length; i++) {
            this.<%= entityInstancePlural %>.push(data[i]);
        }
    }

    <%_ }} _%>
    private onError(error) {
        this.alertService.error(error.message, null, null);
    }
}
