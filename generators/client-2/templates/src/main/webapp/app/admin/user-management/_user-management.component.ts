import {Component, OnInit, Inject} from '@angular/core';
import { Response } from '@angular/http';

import { User } from './user.model';
import { UserService } from './user.service';
import { Principal } from '../../shared';
import { AlertService } from "../../shared";
import { ParseLinks } from "../../shared/";
import { ITEMS_PER_PAGE } from '../../shared';

@Component({
    selector: 'user-mgmt',
    templateUrl: 'app/admin/user-management/user-management.html'
})
export class UserMgmtComponent implements OnInit {

    currentAccount: any;
    users: User[];
    error: any;
    success: any;
    links: any;
    totalItems: any;
    queryCount: any;
    itemsPerPage: any;
    page: any;
    predicate: any;
    reverse: any;

    constructor(private userService: UserService, private parseLinks: ParseLinks, private alertService: AlertService, private principal: Principal) {
        this.itemsPerPage = ITEMS_PER_PAGE;
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
        this.userService.findAll().subscribe((res: Response) => this.onSuccess(res.json(), res.headers), (res: Response) => this.onError(res.json()));
    }
    onSuccess (data, headers) {
        //hide anonymous user from user management: it's a required user for Spring Security
        for (var i in data) {
            if (data[i]['login'] === 'anonymoususer') {
                data.splice(i, 1);
            }
        }
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count');
        this.queryCount = this.totalItems;
        // this.page = pagingParams.page;
        this.users = data;
    }
    onError (error) {
        // this.alertService.error(error.data.message);
    }
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
        console.log("TRANSITIONING")
        // $state.transitionTo($state.$current, {
        //     page: this.page,
        //     sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
        // });
    }
}


//     UserManagementController.$inject = ['Principal', 'User', 'ParseLinks'<% if (databaseType !== 'cassandra') { %>, '$state', 'pagingParams', 'paginationConstants'<% } %><% if (enableTranslation) { %>, '<%=jhiPrefixCapitalized%>LanguageService'<% } %>, 'AlertService' ];
//     function UserManagementController(Principal, User, ParseLinks<% if (databaseType !== 'cassandra') { %>, $state, pagingParams, paginationConstants<% } %><% if (enableTranslation) { %>, <%=jhiPrefixCapitalized%>LanguageService<% } %>, AlertService ) {
//         vm.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
//         vm.languages = null;
//          vm.page = 1;
//         vm.totalItems = null;
//         vm.clear = clear;
//         vm.links = null;
//         vm.loadPage = loadPage;
//         vm.predicate = pagingParams.predicate;
//         vm.reverse = pagingParams.ascending;
//         vm.itemsPerPage = paginationConstants.itemsPerPage;
//
//         <% if (enableTranslation) { %>
//         <%=jhiPrefixCapitalized%>LanguageService.getAll().then(function (languages) {
//             vm.languages = languages;
//         });<% } %>
