import { Component, OnInit, OnDestroy } from '@angular/core';
import { Response } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { EventManager, ParseLinks, PaginationUtil<% if (enableTranslation) { %>, JhiLanguageService<% } %>, AlertService<% if (fieldsContainBlob) { %>, DataUtils<% } %> } from 'ng-jhipster';

import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
import { <%= entityAngularName %>Service } from './<%= entityFileName %>.service';
import { ITEMS_PER_PAGE, Principal } from '../../shared';
import { PaginationConfig } from '../../blocks/config/uib-pagination.config';

@Component({
    selector: '<%= jhiPrefix %>-<%= entityFileName %>',
    templateUrl: './<%= entityFileName %>.component.html'
})
export class <%= entityAngularName %>Component implements OnInit, OnDestroy {
    <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
<%- include('pagination-template'); -%>
    <%_ } else if (pagination === 'infinite-scroll') { _%>
<%- include('infinite-scroll-template'); -%>
    <%_ } else if (pagination === 'no') { _%>
<%- include('no-pagination-template'); -%>
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

    trackId (index: number, item: <%= entityAngularName %>) {
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
    <%_ let eventCallBack = 'this.loadAll()';
    if (pagination === 'infinite-scroll') {
        eventCallBack = 'this.reset()';
    } _%>
    registerChangeIn<%= entityClassPlural %>() {
        this.eventSubscriber = this.eventManager.subscribe('<%= entityInstance %>ListModification', (response) => <%= eventCallBack %>);
    }

    <%_ if (pagination !== 'no') { _%>
        <%_ if (databaseType !== 'cassandra') { _%>
    sort () {
        let result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

        <%_ } _%>
        <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
    private onSuccess (data, headers) {
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

    private onError (error) {
        this.alertService.error(error.message, null, null);
    }
}
