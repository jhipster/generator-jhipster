import { Transition } from 'ui-router-ng2';
import { <%=jhiPrefixCapitalized%>TrackerComponent } from './tracker.component';

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
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('tracker');
            return $translate.refresh();
        }]
    }/*,
    onEnter: (trans: Transition) => {
        trans.injector().get('TrackerService').subscribe();
    },
    onExit: (trans: Transition) => {
        trans.injector().get('TrackerService').unsubscribe();
    }*/
}
