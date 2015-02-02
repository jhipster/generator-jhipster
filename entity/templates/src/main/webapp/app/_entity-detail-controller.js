'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>DetailController', function ($scope, $stateParams<% for (idx in differentTypes) { %>, <%= differentTypes[idx] %><% } %>) {
        $scope.<%= entityInstance %> = {};
        $scope.load = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
              $scope.<%= entityInstance %> = result;
            });
        };
        $scope.load($stateParams.id);
    });
