import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, PaginationUtil, ParseLinks, JhiLanguageService, AlertService } from 'ng-jhipster';

import { User } from './user.model';
import { UserService } from './user.service';
import { UserModalService } from './user-modal.service';
import { UserMgmtDialogComponent } from './user-management-dialog.component';
import { UserMgmtDeleteDialogComponent } from './user-management-delete-dialog.component';
import { ITEMS_PER_PAGE, Principal } from '../../shared';
import { PaginationConfig } from '../../blocks/config/uib-pagination.config';

@Component({
    selector: '<%=jhiPrefix%>-user-mgmt',
    templateUrl: './user-management.component.html'
})
export class UserMgmtComponent implements OnInit {

    currentAccount: any;
    users: User[];
    error: any;
    success: any;
    modalRef: NgbModalRef;
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
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        private userService: UserService,
        private parseLinks: ParseLinks,
        private alertService: AlertService,
        private principal: Principal,
        private eventManager: EventManager<%_ if (databaseType !== 'cassandra') { _%>,
        private paginationUtil: PaginationUtil,
        private paginationConfig: PaginationConfig,
        <%_ } _%>
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private userModalService: UserModalService
    ) {
        <%_ if (databaseType !== 'cassandra') { _%>
        this.activatedRoute.data.subscribe(data => {
            this.page = data['pagingParams'].page;
            this.previousPage = data['pagingParams'].page;
            this.reverse = data['pagingParams'].reverse;
            this.predicate = data['pagingParams'].predicate;
        });
        <%_ } _%>
        <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(['user-management']);
        <%_ } _%>
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.currentAccount = account;
            this.loadAll();
            this.registerChangeInUsers();
        });
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
        this.router.navigate(['/user-management', {page: this.page, sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')}]);
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

    private onError(error) {
        this.alertService.error(error.error, error.message, null);
    }

    createUser() {
        this.modalRef = this.userModalService.open(UserMgmtDialogComponent);
    }

    editUser(login: string) {
        this.modalRef =  this.userModalService.open(UserMgmtDialogComponent, login);
    }

    deleteUser(login: string) {
        this.modalRef =  this.userModalService.open(UserMgmtDeleteDialogComponent, login);
    }

}
