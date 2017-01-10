import { Transition, Ng2StateDeclaration } from 'ui-router-ng2';
import { JhiLanguageService } from 'ng-jhipster';

import { <%=jhiPrefixCapitalized%>TrackerComponent } from './tracker.component';
import { <%=jhiPrefixCapitalized%>TrackerService } from '../../shared';

export const trackerState: Ng2StateDeclaration = {
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
        deps: [JhiLanguageService],
        resolveFn: (languageService: JhiLanguageService) => languageService.setLocations(['tracker'])
    }],
    onEnter: (trans: Transition) => {
        trans.injector().get(<%=jhiPrefixCapitalized%>TrackerService).subscribe();
    },
    onExit: (trans: Transition) => {
        trans.injector().get(<%=jhiPrefixCapitalized%>TrackerService).unsubscribe();
    }
};
