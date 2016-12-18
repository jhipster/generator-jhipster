import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';

import { StateService } from 'ui-router-ng2';

import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';
import { EventManager, AlertService, ITEMS_PER_PAGE, ParseLinks, Principal, PaginationUtil } from '../../shared';

@Component({
    selector: '<%= entityFileName %>-mgmt',
    templateUrl: './<%= entityFileName %>-management.component.html'
})
export class <%= entityClass %>MgmtComponent implements OnInit {

    currentAccount: any;
    <%= entityInstancePlural %>: <%= entityClass %>[];
    error: any;
    success: any;
    <%_ if (databaseType !== 'cassandra') { _%>
    links: any;
    totalItems: any;
    queryCount: any;
    itemsPerPage: any;
    page: any;
    predicate: any;
    previousPage: any;
    reverse: any;
    <%_ } _%>

    constructor(
        private <%= entityInstance %>Service: <%= entityClass %>Service,
        private parseLinks: ParseLinks,
        private alertService: AlertService,
        <%_ if (databaseType !== 'cassandra') { _%>
        private principal: Principal,
        <%_ } _%>
        private $state: StateService,
        private eventManager: EventManager,
        private paginationUtil: PaginationUtil
    ) {
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.page = paginationUtil.parsePage($state.params['page']);
        this.previousPage = this.page;
        this.reverse = paginationUtil.parseAscending($state.params['sort']);
        this.predicate = paginationUtil.parsePredicate($state.params['sort']);
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeIn<%= entityClassPlural %>();
    }

    registerChangeIn<%= entityClassPlural %>() {
        this.eventManager.subscribe('<%= entityInstance %>ListModification', (response) => this.loadAll());
    }
    loadAll () {
        this.<%= entityInstance %>Service.query({
            page: this.page -1,
            size: this.itemsPerPage,
            sort: this.sort()
        }).subscribe(
            (res: Response) => this.onSuccess(res.json(), res.headers),
            (res: Response) => this.onError(res.json())
        );
    }
    private onSuccess (data, headers) {
        <%_ if (databaseType !== 'cassandra') { _%>
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count');
        this.queryCount = this.totalItems;
        // this.page = pagingParams.page;
        <%_ } _%>
        this.<%= entityInstancePlural %> = data;
    }
    private onError (error) {
        this.alertService.error(error.message, null, null);
    }
    <%_ if (databaseType !== 'cassandra') { _%>
    sort () {
        let result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }
    loadPage (page: number) {
        if(page !== this.previousPage) {
            this.previousPage = page;
            this.transition();
        }
    }
    transition = () => {
        this.$state.transitionTo(this.$state.$current, {
            page: this.page,
            sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
        });
    }

    reset () {
        this.page = 0;
        this.$state.transitionTo(this.$state.$current, {
            page: this.page,
            sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
        });
    }
    <%_ } _%>
}
