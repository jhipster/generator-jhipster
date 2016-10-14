import { <%=jhiPrefixCapitalized%>DocsComponent } from './docs.component';

export const docsState = {
    name: 'docs',
    parent: 'admin',
    url: '/docs',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'global.menu.admin.apidocs'
    },
    views: {
        'content@': { component: <%=jhiPrefixCapitalized%>DocsComponent }
    }
}
