(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('gateway', {
            parent: 'admin',
            url: '/gateway',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'gateway.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/gateway/gateway.html',
                    controller: 'GatewayController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('gateway');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
