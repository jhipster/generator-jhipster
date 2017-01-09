import { Ng2StateDeclaration } from "ui-router-ng2";
import { <%=jhiPrefixCapitalized%>DocsComponent } from './docs.component';

export const docsState: Ng2StateDeclaration = {
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
};
