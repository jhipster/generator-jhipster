'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('<%= entityInstance %>', {
                parent: 'entity',
                url: '/<%= entityInstance %>',
                data: {
                    roles: ['ROLE_USER']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/<%= entityInstance %>/<%= entityInstance %>s.html',
                        controller: '<%= entityClass %>Controller'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('<%= entityInstance %>');
                        return $translate.refresh();
                    }]
                }
            })
            .state('<%= entityInstance %>Detail', {
                parent: 'entity',
                url: '/<%= entityInstance %>/:id',
                data: {
                    roles: ['ROLE_USER']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/<%= entityInstance %>/<%= entityInstance %>-detail.html',
                        controller: '<%= entityClass %>DetailController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('<%= entityInstance %>');
                        return $translate.refresh();
                    }]
                }
            });
    });
