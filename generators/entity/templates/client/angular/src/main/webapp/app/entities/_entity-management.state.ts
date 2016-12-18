import { Transition } from 'ui-router-ng2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PaginationConfig } from '../../blocks/config/uib-pagination.config';
import { <%= entityClass %>MgmtComponent } from './<%= entityFileName %>-management.component';
import { <%= entityClass %>MgmtDetailComponent } from './<%= entityFileName %>-management-detail.component';
import { <%= entityClass %>MgmtDialogComponent } from './<%= entityFileName %>-management-dialog.component';
import { <%= entityClass %>MgmtDeleteDialogComponent } from './<%= entityFileName %>-management-delete-dialog.component';
import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';
import { <% if (enableTranslation){ %>JhiLanguageService, <% } %>PaginationUtil } from '../../shared';

export const <%= entityInstance %>MgmtState = {
    name: '<%= entityStateName %>',
    parent: 'entity',
    url: '/<%= entityUrl %><% if (pagination == 'pagination' || pagination == 'pager') { %>?page&sort&search<% } %>',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
    },
    views: {
        'content@': { component: <%= entityClass %>MgmtComponent }
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
        },
        search: null
    },
    resolve: [
        {
            token: 'pagingParams',
            deps: [PaginationUtil, '$stateParams', PaginationConfig],
            resolveFn: (paginationUtil, stateParams) => {
                return {
                    page: paginationUtil.parsePage(stateParams['page']),
                    sort: stateParams['sort'],
                    predicate: paginationUtil.parsePredicate(stateParams['sort']),
                    ascending: paginationUtil.parseAscending(stateParams['sort']),
                    search: stateParams['search']
                };
            }
        }<% if (enableTranslation){ %>,
        {
            token: 'translate',
            deps: [JhiLanguageService],
            resolveFn: (languageService) => languageService.setLocations(['<%= entityInstance %>'])
        }<% } %>

    ]
    <%_ } else { _%>
    resolve: [
        {
            token: 'translate',
            deps: [JhiLanguageService],
            resolveFn: (languageService) => languageService.setLocations(['<%= entityInstance %>'])
        }
    ]
    <%_ } _%>

};

export const <%= entityInstance %>MgmtDetailState = {
    name: '<%= entityStateName %>-detail',
    parent: 'entity',
    url: '/<%= entityStateName %>/:id',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: '<%= entityInstance %>Management.detail.title'
    },
    views: {
        'content@': { component: <%= entityClass %>MgmtDetailComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [JhiLanguageService],
        resolveFn: (languageService) => languageService.setLocations(['<%= entityInstance %>'])
    }]
};

export const <%= entityInstance %>MgmtNewState = {
    name: '<%= entityStateName %>.new',
    url: '/new',
    data: {
        authorities: ['ROLE_USER']
    },
    onEnter: (trans: Transition) => {
        let $state = trans.router.stateService;
        let modalService = trans.injector().get(NgbModal);
        const modalRef  = modalService.open(<%= entityClass %>MgmtDialogComponent, { size: 'lg', backdrop: 'static'});
        modalRef.componentInstance.<%= entityInstance %> = new <%= entityClass %>();
        modalRef.result.then((result) => {
            console.log(`Closed with: ${result}`);
            $state.go('<%= entityInstance %>', null, { reload: true });
        }, (reason) => {
            console.log(`Dismissed ${reason}`);
            $state.go('<%= entityInstance %>');
        });
    }
};

export const <%= entityInstance %>MgmtEditState = {
    name: '<%= entityStateName %>.edit',
    url: '/{id}/edit',
    data: {
        authorities: ['ROLE_USER']
    },
    onEnter: (trans: Transition) => {
        let $state = trans.router.stateService;
        let modalService = trans.injector().get(NgbModal);
        let <%= entityInstance %>Service: <%= entityClass %>Service = trans.injector().get(<%= entityClass %>Service);
        let id = trans.params()['id'];
        <%= entityInstance %>Service.find(id).subscribe(<%= entityInstance %> => {
            const modalRef  = modalService.open(<%= entityClass %>MgmtDialogComponent, { size: 'lg', backdrop: 'static'});
            modalRef.componentInstance.<%= entityInstance %> = <%= entityInstance %>;
            modalRef.result.then((result) => {
                console.log(`Closed with: ${result}`);
                $state.go('<%= entityInstance %>', null, { reload: true });
            }, (reason) => {
                console.log(`Dismissed ${reason}`);
                $state.go('<%= entityInstance %>');
            });
        });
    }
};

export const <%= entityInstance %>MgmtDeleteState = {
    name: '<%= entityStateName %>.delete',
    url: '/{id}/delete',
    data: {
        authorities: ['ROLE_USER']
    },
    onEnter: (trans: Transition) => {
        let $state = trans.router.stateService;
        let modalService = trans.injector().get(NgbModal);
        let <%= entityInstance %>Service: <%= entityClass %>Service = trans.injector().get(<%= entityClass %>Service);
        let id = trans.params()['id'];
        <%= entityInstance %>Service.find(id).subscribe(<%= entityInstance %> => {
            const modalRef  = modalService.open(<%= entityClass %>MgmtDeleteDialogComponent, { size: 'md'});
            modalRef.componentInstance.<%= entityInstance %> = <%= entityInstance %>;
            modalRef.result.then((result) => {
                console.log(`Closed with: ${result}`);
                $state.go('<%= entityInstance %>', null, { reload: true });
            }, (reason) => {
                console.log(`Dismissed ${reason}`);
                $state.go('<%= entityInstance %>');
            });
        });
    }
};
