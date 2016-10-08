import { UserMgmtComponent } from './user-management.component';

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
        },<%_ if (databaseType !== 'cassandra') { _%>
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
    resolve: {
        // pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
        //     return {
        //         page: PaginationUtil.parsePage($stateParams.page),
        //         sort: $stateParams.sort,
        //         predicate: PaginationUtil.parsePredicate($stateParams.sort),
        //         ascending: PaginationUtil.parseAscending($stateParams.sort)
        //     };
        // }]<%_ if (enableTranslation){ _%>,
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('user-management');
            return $translate.refresh();
        }]
        <%_ } _%>

    }<%_ } else { _%>

        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('user-management');
                return $translate.refresh();
            }]
        }
    <%_ } _%>

};
