'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('<%= entityInstance %>Details', {
                parent: 'entity',
                url: '/<%= entityInstance %>/:id',
                data: {
                    roles: ['ROLE_USER']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/<%= entityInstance %>/<%= entityInstance %>Details.html',
                        controller: '<%= entityClass %>DetailsController'
                    }
                }
            });
    })
    .controller('<%= entityClass %>DetailsController', function ($scope, $stateParams, <%= entityClass %><% for (relationshipId in relationships) { %>, <%= relationships[relationshipId].otherEntityNameCapitalized %><% } %>) {
        $scope.<%= entityInstance %> = {};

        $scope.load = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
              $scope.<%= entityInstance %> = result;
            });
        };
        
        $scope.load($stateParams.id);

    });
