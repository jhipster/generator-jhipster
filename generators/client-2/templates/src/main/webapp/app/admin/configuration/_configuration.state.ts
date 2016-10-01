import { <%=jhiPrefixCapitalized%>ConfigurationComponent } from './configuration.component';

export const configState = {
    name: '<%=jhiPrefix%>-configuration',
    parent: 'admin',
    url: '/configuration',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'configuration.title'
    },
    views: {
        'content@': { component: <%=jhiPrefixCapitalized%>ConfigurationComponent }
    },
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('configuration');
            return $translate.refresh();
        }]
    }
}
