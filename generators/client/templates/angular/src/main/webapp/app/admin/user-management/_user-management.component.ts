import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';

import { StateService } from 'ui-router-ng2';

import { User } from './user.model';
import { UserService } from './user.service';
import { AlertService, EventManager, ITEMS_PER_PAGE, PaginationUtil, ParseLinks, Principal } from '../../shared';

@Component({
    selector: '<%=jhiPrefix%>-user-mgmt',
    templateUrl: './user-management.component.html'
})
export class UserMgmtComponent implements OnInit {

    currentAccount: any;
    users: User[];
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
        private userService: UserService,
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
        this.predicate = 'id';
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInUsers();
    }

    registerChangeInUsers() {
        this.eventManager.subscribe('userListModification', (response) => this.loadAll());
    }

    setActive (user, isActivated) {
        user.activated = isActivated;

        this.userService.update(user).subscribe(
            response => {
                if (response.status === 200) {
                    this.error = null;
                    this.success = 'OK';
                    this.loadAll();
                } else {
                    this.success = null;
                    this.error = 'ERROR';
                }
            });
    }

    loadAll () {
        this.userService.query({
            page: this.page -1,
            size: this.itemsPerPage,
            sort: this.sort()
        }).subscribe(
            (res: Response) => this.onSuccess(res.json(), res.headers),
            (res: Response) => this.onError(res.json())
        );
    }

    trackIdentity (index, item: User) {
        return item.id;
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
        if (page !== this.previousPage) {
            this.previousPage = page;
            this.transition();
        }
    }

    transition () {
        this.$state.transitionTo(this.$state.$current, {
            page: this.page,
            sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
        });
    }
    <%_ } _%>

    private onSuccess(data, headers) {
        // hide anonymous user from user management: it's a required user for Spring Security
        let hiddenUsersSize = 0;
        for (let i in data) {
            if (data[i]['login'] === 'anonymoususer') {
                data.splice(i, 1);
                hiddenUsersSize++;
            }
        }
        <%_ if (databaseType !== 'cassandra') { _%>
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count') - hiddenUsersSize;
        this.queryCount = this.totalItems;
        <%_ } _%>
        this.users = data;
    }

    private onError (error) {
        this.alertService.error(error.error, error.message, null);
    }
}
