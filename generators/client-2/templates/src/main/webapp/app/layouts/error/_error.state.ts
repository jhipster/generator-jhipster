import { ErrorComponent } from './error.component';

export const errorState = {
    name: 'error',
    parent: 'app',
    url: '/error',
    data: {
        authorities: [],
        pageTitle: 'error.title'
    },
    views: {
        'content@': { component: ErrorComponent }
    },
    resolve: {
        mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
            $translatePartialLoader.addPart('error');
            return $translate.refresh();
        }]
    }
}

export const accessdeniedState = {
    name: 'accessdenied',
    parent: 'app',
    url: '/accessdenied',
    data: {
        authorities: []
    },
    views: {
        'content@': { component: ErrorComponent }
    },
    resolve: {
        mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
            $translatePartialLoader.addPart('error');
            return $translate.refresh();
        }]
    }
}
