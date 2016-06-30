AuditStateConfig.$inject = ['$stateProvider'];

export function AuditStateConfig($stateProvider) {
    $stateProvider.state('audits', {
        parent: 'admin',
        url: '/audits',
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'audits.title'
        },
        views: {
            'content@': {
                template: '<<%=jhiPrefix%>-audit></<%=jhiPrefix%>-audit>'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('audits');
                return $translate.refresh();
            }]
        }
    });
}
