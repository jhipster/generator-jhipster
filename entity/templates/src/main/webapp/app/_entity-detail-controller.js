'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>DetailController', function ($scope, $stateParams, <%= entityClass %><% for (relationshipId in relationships) { %>, <%= relationships[relationshipId].otherEntityNameCapitalized %><% } %>) {
        $scope.<%= entityInstance %> = {};
        $scope.load = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
              $scope.<%= entityInstance %> = result;
            });
        };
        $scope.load($stateParams.id);
    });
