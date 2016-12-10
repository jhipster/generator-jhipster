(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('social-register', {
            parent: 'account',
            url: '/social-register/:provider?{success:boolean}',
            data: {
                authorities: [],
                pageTitle: 'social.register.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/social/social-register.html',
                    controller: 'SocialRegisterController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('social');
                    return $translate.refresh();
                }]
            }
        })<% if (authenticationType == 'jwt') { %>
        .state('social-auth', {
            parent: 'account',
            url: '/social-auth',
            data: {
                authorities: []
            },
            views: {
                'content@': {
                    controller: 'SocialAuthController'
                }
            }
        })<% } %>;
    }
})();
