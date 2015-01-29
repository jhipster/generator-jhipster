angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tracker', {
                parent: 'admin',
                url: '/tracker',
                data: {
                    roles: ['ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/tracker/tracker.html',
                        controller: 'TrackerController'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('tracker');
                        return $translate.refresh();
                    }]
                }
            });
    });
