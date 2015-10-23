'use strict';


(function () {
    'use strict';
    angular
        .module('<%=angularAppName%>.account.login')
        .controller('LoginController', controller);
    config.inject = [];
    /* @ngInject */
    function controller($stateProvider) {

        var vm = this;

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
                        controller: 'LoginController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('login');
                        return $translate.refresh();
                    }]
                }
            });

    }
})();
