import { <%=jhiPrefixCapitalized%>GatewayComponent } from './gateway.component';

export const gatewayState = {
    name: 'gateway',
    parent: 'admin',
    url: '/gateway',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'gateway.title'
    },
    views: {
        'content@': { component: <%=jhiPrefixCapitalized%>GatewayComponent }
    },
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('gateway');
            return $translate.refresh();
        }]
    }
}
