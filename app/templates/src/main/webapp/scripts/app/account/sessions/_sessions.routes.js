
(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(configure);

    configure.$inject = ['$stateProvider'];
    /* @ngInject */
    function configure($stateProvider){

        $stateProvider
            .state('sessions', {
                parent: 'account',
                url: '/sessions',
                data: {
                    authorities: ['ROLE_USER'],
                    pageTitle: 'global.menu.account.sessions'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/sessions/sessions.html',
                        controller: 'SessionsController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('sessions');
                        return $translate.refresh();
                    }]
                }
            });

    }
})();
