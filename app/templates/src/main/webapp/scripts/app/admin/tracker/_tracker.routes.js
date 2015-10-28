(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(configure);

    configure.$inject = ['$stateProvider'];
    /* @ngInject */
    function configure($stateProvider){

        $stateProvider
            .state('tracker', {
                parent: 'admin',
                url: '/tracker',
                data: {
                    authorities: ['ROLE_ADMIN'],
                    pageTitle: 'tracker.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/tracker/tracker.html',
                        controller: 'TrackerController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('tracker');
                        return $translate.refresh();
                    }]
                },
                onEnter: function(Tracker) {
                    Tracker.subscribe();
                },
                onExit: function(Tracker) {
                    Tracker.unsubscribe();
                },
            });

    }
})();
