(function () {
    'use strict';
    angular
        .module('<%=angularAppName%>')
        .config(config);

    config.inject = ['$stateProvider'];

    /* @ngInject */
    function config($stateProvider) {

        $stateProvider
            .state('login', {
                parent: 'account',
                url: '/login',
                data: {
                    authorities: [],
                    pageTitle: 'login.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/login/login.html',
                        controller: 'LoginController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('login');
                        return $translate.refresh();
                    }]
                },
                controllerAs: 'vm'
            });

    }
})();
