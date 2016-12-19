<%_
var i18nToLoad = [entityInstance];
for (var idx in fields) {
    if (fields[idx].fieldIsEnum == true) {
        i18nToLoad.push(fields[idx].enumInstance);
    }
}
_%>
import { Transition } from 'ui-router-ng2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PaginationConfig } from '../../blocks/config/uib-pagination.config';
import { <%= entityAngularJSName %>Component } from './<%= entityFileName %>-management.component';
import { <%= entityAngularJSName %>DetailComponent } from './<%= entityFileName %>-management-detail.component';
import { <%= entityAngularJSName %>DialogComponent } from './<%= entityFileName %>-management-dialog.component';
import { <%= entityAngularJSName %>DeleteDialogComponent } from './<%= entityFileName %>-management-delete-dialog.component';
import { <%= entityClass %> } from './<%= entityFileName %>.model';
import { <%= entityClass %>Service } from './<%= entityFileName %>.service';
import { <% if (enableTranslation){ %>JhiLanguageService, <% } %>PaginationUtil } from '../../shared';

export const <%= entityInstance %>State = {
    name: '<%= entityStateName %>',
    parent: 'entity',
    url: '/<%= entityUrl %><% if (pagination == 'pagination' || pagination == 'pager') { %>?page&sort&search<% } %>',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.home.title'<% }else{ %>'<%= entityClassPlural %>'<% } %>
    },
    views: {
        'content@': { component: <%= entityAngularJSName %>Component }
    },
    <%_ if (pagination == 'pagination' || pagination == 'pager'){ _%>
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
    <%_ } _%>
    resolve: [
        <%_ if (pagination == 'pagination' || pagination == 'pager'){ _%>
        {
            token: 'pagingParams',
            deps: [PaginationUtil, Transition],
            resolveFn: (paginationUtil: PaginationUtil, trans: Transition) => {
                return {
                    page: paginationUtil.parsePage(trans.params()['page']),
                    sort: trans.params()['sort'],
                    search: trans.params()['search'],
                    predicate: paginationUtil.parsePredicate(trans.params()['sort']),
                    ascending: paginationUtil.parseAscending(trans.params()['sort'])
                };
            }
        }<%= (pagination == 'pagination' || pagination == 'pager' && enableTranslation) ? ',' : '' %>
        <%_ } if (enableTranslation){ _%>
        {
            token: 'translate',
            deps: [JhiLanguageService],
            resolveFn: (languageService) => languageService.setLocations(['<%= i18nToLoad %>'])
        }
        <%_ } _%>
    ]
};

export const <%= entityInstance %>DetailState = {
    name: '<%= entityStateName %>-detail',
    parent: 'entity',
    url: '/<%= entityUrl %>/:id',
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: <% if (enableTranslation){ %>'<%= angularAppName %>.<%= entityTranslationKey %>.detail.title'<% }else{ %>'<%= entityClass %>'<% } %>
    },
    views: {
        'content@': { component: <%= entityAngularJSName %>DetailComponent }
    },
    resolve: [
        <%_ if (enableTranslation){ _%>
        {
            token: 'translate',
            deps: [JhiLanguageService],
            resolveFn: (languageService) => languageService.setLocations(['<%= i18nToLoad %>'])
        },
        <%_ } _%>
        {
            token: 'previousState',
            deps: [Transition],
            resolveFn: (trans: Transition) => {
                //TODO this needs to be tested
                const stateParams = trans.params();
                const stateService = trans.router.stateService;
                const currentStateData = {
                    name: stateService.current.name || '<%= entityStateName %>',
                    params: stateParams,
                    url: stateService.href(stateService.current.name, stateParams)
                };
                return currentStateData;
            }
        }
    ]
};

export const <%= entityInstance %>NewState = {
    name: '<%= entityStateName %>.new',
    url: '/new',
    data: {
        authorities: ['ROLE_USER']
    },
    onEnter: (trans: Transition) => {
        let $state = trans.router.stateService;
        let modalService = trans.injector().get(NgbModal);
        const modalRef  = modalService.open(<%= entityAngularJSName %>DialogComponent, { size: 'lg', backdrop: 'static'});
        modalRef.componentInstance.<%= entityInstance %> = new <%= entityClass %>();
        modalRef.result.then((result) => {
            console.log(`Closed with: ${result}`);
            $state.go('<%= entityStateName %>', null, { reload: '<%= entityStateName %>' });
        }, (reason) => {
            console.log(`Dismissed ${reason}`);
            $state.go('<%= entityStateName %>');
        });
    }
};

export const <%= entityInstance %>EditState = {
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
            const modalRef  = modalService.open(<%= entityAngularJSName %>DialogComponent, { size: 'lg', backdrop: 'static'});
            modalRef.componentInstance.<%= entityInstance %> = <%= entityInstance %>;
            modalRef.result.then((result) => {
                console.log(`Closed with: ${result}`);
                $state.go('<%= entityStateName %>', null, { reload: '<%= entityStateName %>' });
            }, (reason) => {
                console.log(`Dismissed ${reason}`);
                $state.go('^');
            });
        });
    }
};

export const <%= entityInstance %>DeleteState = {
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
            const modalRef  = modalService.open(<%= entityAngularJSName %>DeleteDialogComponent, { size: 'md'});
            modalRef.componentInstance.<%= entityInstance %> = <%= entityInstance %>;
            modalRef.result.then((result) => {
                console.log(`Closed with: ${result}`);
                $state.go('<%= entityStateName %>', null, { reload: '<%= entityStateName %>' });
            }, (reason) => {
                console.log(`Dismissed ${reason}`);
                $state.go('^');
            });
        });
    }
};
