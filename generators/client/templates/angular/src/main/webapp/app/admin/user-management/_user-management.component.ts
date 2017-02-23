import { Component, OnInit, OnDestroy } from '@angular/core';
import { Response } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { EventManager, PaginationUtil, ParseLinks, AlertService, JhiLanguageService } from 'ng-jhipster';

import { ITEMS_PER_PAGE, Principal, User, UserService } from '../../shared';
import { PaginationConfig } from '../../blocks/config/uib-pagination.config';

@Component({
    selector: '<%=jhiPrefix%>-user-mgmt',
    templateUrl: './user-management.component.html'
})
export class UserMgmtComponent implements OnInit, OnDestroy {

    currentAccount: any;
    users: User[];
    error: any;
    success: any;
    <%_ if (databaseType !== 'cassandra') { _%>
    routeData: any;
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
        private jhiLanguageService: JhiLanguageService,
        private userService: UserService,
        private parseLinks: ParseLinks,
        private alertService: AlertService,
        private principal: Principal,
        private eventManager: EventManager,<%_ if (databaseType !== 'cassandra') { _%>
        private paginationUtil: PaginationUtil,
        private paginationConfig: PaginationConfig,
        <%_ } _%>
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {
        <%_ if (databaseType !== 'cassandra') { _%>
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.routeData = this.activatedRoute.data.subscribe(data => {
            this.page = data['pagingParams'].page;
            this.previousPage = data['pagingParams'].page;
            this.reverse = data['pagingParams'].ascending;
            this.predicate = data['pagingParams'].predicate;
        });
        <%_ } _%>
        this.jhiLanguageService.setLocations(['user-management']);
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.currentAccount = account;
            this.loadAll();
            this.registerChangeInUsers();
        });
    }

    ngOnDestroy() {
        <%_ if (databaseType !== 'cassandra') { _%>
        this.routeData.unsubscribe();
        <%_ } _%>
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
        this.userService.query(<%_ if (databaseType !== 'cassandra') { _%>{
            page: this.page - 1,
            size: this.itemsPerPage,
            sort: this.sort()}<%_ } _%>).subscribe(
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
        this.router.navigate(['/user-management'], { queryParams:
                {
                    page: this.page,
                    sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
                }
        });
        this.loadAll();
    }

    <%_ } _%>
    private onSuccess(data, headers) {
        <%_ if (databaseType !== 'cassandra') { _%>
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count');
        this.queryCount = this.totalItems;
        <%_ } _%>
        this.users = data;
    }

    private onError(error) {
        this.alertService.error(error.error, error.message, null);
    }
}
