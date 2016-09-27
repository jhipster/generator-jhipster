import { ActivateComponent } from "./activate.component";

export const activateState = {
    name: 'activate',
    parent: 'account',
    url: '/activate?key',
    data: {
        authorities: [],
        pageTitle: 'activate.title'
    },
    views: {
        'content@': { component: ActivateComponent }
    },
    resolve: {
        translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('activate');
            return $translate.refresh();
        }]
    }
};
