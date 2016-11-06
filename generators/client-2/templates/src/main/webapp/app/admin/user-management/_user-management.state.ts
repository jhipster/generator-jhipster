import { Transition } from 'ui-router-ng2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserMgmtComponent } from './user-management.component';
import { UserMgmtDetailComponent } from './user-management-detail.component';
import { UserMgmtDialogComponent } from './user-management-dialog.component';
import { UserMgmtDeleteDialogComponent } from './user-management-delete-dialog.component';
import { User } from './user.model';
import { UserService } from './user.service';
import { <% if (enableTranslation){ %><%=jhiPrefixCapitalized%>LanguageService, <% } %>PaginationUtil } from '../../shared';

export const userMgmtState = {
    name: 'user-management',
    parent: 'admin',
    url: '/user-management<%_ if (databaseType !== 'cassandra') { _%>?page&sort<%_ } _%>',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'user-management.home.title'
    },
    views: {
        'content@': { component: UserMgmtComponent }
    },
    <%_ if (databaseType !== 'cassandra') { _%>
    params: {
        page: {
            value: '1',
            squash: true
        },
        sort: {
            value: 'id,asc',
            squash: true
        }
    },
    resolve: [
        {
            token: 'pagingParams',
            deps: [PaginationUtil, '$stateParams'],
            resolveFn: (paginationUtil, stateParams) => {
                return {
                    page: paginationUtil.parsePage(stateParams['page']),
                    sort: stateParams['sort'],
                    predicate: paginationUtil.parsePredicate(stateParams['sort']),
                    ascending: paginationUtil.parseAscending(stateParams['sort'])
                };
            }
        }<% if (enableTranslation){ %>,
        {
            token: 'translate',
            deps: [<%=jhiPrefixCapitalized%>LanguageService],
            resolveFn: (languageService) => languageService.setLocations(['user-management'])
        }<% } %>

    ]
    <%_ } else { _%>
    resolve: [
        {
            token: 'translate',
            deps: [<%=jhiPrefixCapitalized%>LanguageService],
            resolveFn: (languageService) => languageService.setLocations(['user-management'])
        }
    ]
    <%_ } _%>

};
export const userMgmtDetailState = {
    name: 'user-management-detail',
    parent: 'admin',
    url: '/user/:login',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'user-management.detail.title'
    },
    views: {
        'content@': { component: UserMgmtDetailComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['user-management'])
    }]
};
export const userMgmtNewState = {
    name: 'user-management.new',
    url: '/new',
    data: {
        authorities: ['ROLE_ADMIN']
    },
    onEnter: (trans: Transition) => {
        let $state = trans.router.stateService;
        let modalService = trans.injector().get(NgbModal);
        const modalRef  = modalService.open(UserMgmtDialogComponent, { size: 'lg', backdrop: 'static'});
        modalRef.componentInstance.user = new User(null, null, null, null, null, true, null, null, null, null, null, null, null);
        modalRef.result.then((result) => {
            console.log(`Closed with: ${result}`);
            $state.go('user-management', null, { reload: true });
        }, (reason) => {
            console.log(`Dismissed ${reason}`);
            $state.go('user-management');
        });
    }
};


export const userMgmtEditState = {
    name: 'user-management.edit',
    url: '/{login}/edit',
    data: {
        authorities: ['ROLE_ADMIN']
    },
    onEnter: (trans: Transition) => {
        let $state = trans.router.stateService;
        let modalService = trans.injector().get(NgbModal);
        let userService: UserService = trans.injector().get('UserService');
        var login = trans.params()['login'];
        userService.find(login).subscribe(user => {
            const modalRef  = modalService.open(UserMgmtDialogComponent, { size: 'lg', backdrop: 'static'});
            modalRef.componentInstance.user = user;
            modalRef.result.then((result) => {
                console.log(`Closed with: ${result}`);
                $state.go('user-management', null, { reload: true });
            }, (reason) => {
                console.log(`Dismissed ${reason}`);
                $state.go('user-management');
            });
        });
    }
};


export const userMgmtDeleteState = {
    name: 'user-management.delete',
    url: '/{login}/delete',
    data: {
        authorities: ['ROLE_ADMIN']
    },
    onEnter: (trans: Transition) => {
        let $state = trans.router.stateService;
        let modalService = trans.injector().get(NgbModal);
        let userService: UserService = trans.injector().get('UserService');
        var login = trans.params()['login'];
        userService.find(login).subscribe(user => {
            const modalRef  = modalService.open(UserMgmtDeleteDialogComponent, { size: 'md'});
            modalRef.componentInstance.user = user;
            modalRef.result.then((result) => {
                console.log(`Closed with: ${result}`);
                $state.go('user-management', null, { reload: true });
            }, (reason) => {
                console.log(`Dismissed ${reason}`);
                $state.go('user-management');
            });
        });
    }
};
