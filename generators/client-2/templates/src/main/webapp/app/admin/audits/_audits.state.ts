import { AuditsComponent } from './audits.component';

export const auditState = {
    name: 'audits',
    parent: 'admin',
    url: '/audits',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'audits.title'
    },
    views: {
        'content@': { component: AuditsComponent }
    },
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('audits');
            return $translate.refresh();
        }]
    }
}
