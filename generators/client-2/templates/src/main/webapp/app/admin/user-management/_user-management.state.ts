import { UserMgmtComponent } from './user-management.component';
import { UserMgmtDetailComponent } from './user-management-detail.component';
import { UserMgmtDialogComponent } from './user-management-dialog.component';
import { UserMgmtDeleteDialogComponent } from './user-management-delete-dialog.component';

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
        // {
        //     token: 'pagingParams',
        //     deps: ['PaginationUtil', 'StateParams'],
        //     resolveFn: (paginationUtil, stateParams) => {
        //         return {
        //             page: paginationUtil.parsePage(stateParams['page']),
        //             sort: stateParams['sort'],
        //             predicate: paginationUtil.parsePredicate(stateParams['sort']),
        //             ascending: paginationUtil.parseAscending(stateParams['sort'])
        //         };
        //     }
        // }<%_ if (enableTranslation){ _%>,
        {
            token: 'translatePartialLoader',
            deps: ['$translatePartialLoader'],
            resolveFn: (translatePartialLoader) => translatePartialLoader.addPart('user-management')
        }
        <%_ } _%>

    ]<%_ } else { _%>
    resolve: [
        {
            token: 'translatePartialLoader',
            deps: ['$translatePartialLoader'],
            resolveFn: (translatePartialLoader) => translatePartialLoader.addPart('user-management')
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
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('user-management');
            return $translate.refresh();
        }]
    }
};
export const userMgmtNewState = {
    name: 'user-management.new',
    url: '/new',
    data: {
        authorities: ['ROLE_ADMIN']
    },
    // onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
    //     $uibModal.open({
    //         templateUrl: 'app/admin/user-management/user-management-dialog.html',
    //         controller: 'UserManagementDialogController',
    //         controllerAs: 'vm',
    //         backdrop: 'static',
    //         size: 'lg',
    //         resolve: {
    //             entity: function () {
    //                 return {
    //                     id: null, login: null, firstName: null, lastName: null, email: null,
    //                     activated: true, langKey: null, createdBy: null, createdDate: null,
    //                     lastModifiedBy: null, lastModifiedDate: null, resetDate: null,
    //                     resetKey: null, authorities: null
    //                 };
    //             }
    //         }
    //     }).result.then(function() {
    //         $state.go('user-management', null, { reload: true });
    //     }, function() {
    //         $state.go('user-management');
    //     });
    // }]
};


export const userMgmtEditState = {
    name: 'user-management.edit',
    url: '/{login}/edit',
    data: {
        authorities: ['ROLE_ADMIN']
    },
    // onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
    //     $uibModal.open({
    //         templateUrl: 'app/admin/user-management/user-management-dialog.html',
    //         controller: 'UserManagementDialogController',
    //         controllerAs: 'vm',
    //         backdrop: 'static',
    //         size: 'lg',
    //         resolve: {
    //             entity: ['User', function(User) {
    //                 return User.get({login : $stateParams.login});
    //             }]
    //         }
    //     }).result.then(function() {
    //         $state.go('user-management', null, { reload: true });
    //     }, function() {
    //         $state.go('^');
    //     });
    // }]
};


export const userMgmtDeleteState = {
    name: 'user-management.delete',
    url: '/{login}/delete',
    data: {
        authorities: ['ROLE_ADMIN']
    },
    // onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
    //     $uibModal.open({
    //         templateUrl: 'app/admin/user-management/user-management-delete-dialog.html',
    //         controller: 'UserManagementDeleteController',
    //         controllerAs: 'vm',
    //         size: 'md',
    //         resolve: {
    //             entity: ['User', function(User) {
    //                 return User.get({login : $stateParams.login});
    //             }]
    //         }
    //     }).result.then(function() {
    //         $state.go('user-management', null, { reload: true });
    //     }, function() {
    //         $state.go('^');
    //     });
    // }]
};
