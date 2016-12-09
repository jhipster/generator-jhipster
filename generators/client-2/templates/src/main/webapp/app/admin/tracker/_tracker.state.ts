import { Transition } from 'ui-router-ng2';
import { <%=jhiPrefixCapitalized%>TrackerComponent } from './tracker.component';
import { <% if (enableTranslation){ %><%=jhiPrefixCapitalized%>LanguageService, <% } %><%=jhiPrefixCapitalized%>TrackerService } from '../../shared';

export const trackerState = {
    name: '<%=jhiPrefix%>-tracker',
    parent: 'admin',
    url: '/tracker',
    data: {
        authorities: ['ROLE_ADMIN'],
        pageTitle: 'tracker.title'
    },
    views: {
        'content@': { component: <%=jhiPrefixCapitalized%>TrackerComponent }
    },
    resolve: [{
        token: 'translate',
        deps: [<%=jhiPrefixCapitalized%>LanguageService],
        resolveFn: (languageService) => languageService.setLocations(['tracker'])
    }],
    onEnter: (trans: Transition) => {
        trans.injector().get(<%=jhiPrefixCapitalized%>TrackerService).subscribe();
    },
    onExit: (trans: Transition) => {
        trans.injector().get(<%=jhiPrefixCapitalized%>TrackerService).unsubscribe();
    }
}
