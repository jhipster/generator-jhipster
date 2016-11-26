import {Component, OnInit, Inject} from '@angular/core';
import { Response } from '@angular/http';

import { User } from './user.model';
import { UserService } from './user.service';
import { AlertService, ITEMS_PER_PAGE, ParseLinks, Principal } from '../../shared';
import { StateService } from "ui-router-ng2";

@Component({
    selector: 'user-mgmt',
    templateUrl: 'app/admin/user-management/user-management.component.html'
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
    reverse: any;
    <%_ } _%>

    constructor(private userService: UserService,
                private parseLinks: ParseLinks,
                private alertService: AlertService,
                <%_ if (databaseType !== 'cassandra') { _%>
                private principal: Principal,
                <%_ } _%>
                private $state: StateService
    ) {
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.page = 1;
        this.reverse = false;
        this.predicate = 'id';
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
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
    private onSuccess (data, headers) {
        //hide anonymous user from user management: it's a required user for Spring Security
        for (var i in data) {
            if (data[i]['login'] === 'anonymoususer') {
                data.splice(i, 1);
            }
        }
        <%_ if (databaseType !== 'cassandra') { _%>
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count');
        this.queryCount = this.totalItems;
        // this.page = pagingParams.page;
        <%_ } _%>
        this.users = data;
    }
    private onError (error) {
        this.alertService.error(error.error, error.message, null);
    }
    <%_ if (databaseType !== 'cassandra') { _%>
    sort () {
        var result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }
    loadPage (page) {
        this.page = page;
        this.transition();
    }
    transition () {
        this.$state.transitionTo(this.$state.$current, {
            page: this.page,
            sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
        });
    }
    <%_ } _%>
}
