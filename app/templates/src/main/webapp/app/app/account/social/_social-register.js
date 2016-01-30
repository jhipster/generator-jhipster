'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('social-register', {
                parent: 'account',
                url: '/social-register/:provider?{success:boolean}',
                data: {
                    authorities: [],
                    pageTitle: 'social.register.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/social/social-register.html',
                        controller: 'SocialRegisterController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('social');
                        return $translate.refresh();
                    }]
                }
            });
    });
