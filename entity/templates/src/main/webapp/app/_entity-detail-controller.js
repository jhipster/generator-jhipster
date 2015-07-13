'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>DetailController', function ($scope, $rootScope, $stateParams, entity<% for (idx in differentTypes) { %>, <%= differentTypes[idx] %><% } %>) {
        $scope.<%= entityInstance %> = entity;
        $scope.load = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
                $scope.<%= entityInstance %> = result;
            });
        };
        $rootScope.$on('<%=angularAppName%>:<%= entityInstance %>Update', function(event, result) {
            $scope.<%= entityInstance %> = result;
        });
    });
