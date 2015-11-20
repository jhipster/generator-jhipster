'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>DetailController', function ($scope, $rootScope, $stateParams<% if (fieldsContainBlob) { %>, DataUtils<% } %>, entity<% for (idx in differentTypes) { %>, <%= differentTypes[idx] %><% } %>) {
        $scope.<%= entityInstance %> = entity;
        $scope.load = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
                $scope.<%= entityInstance %> = result;
            });
        };
        var unsubscribe = $rootScope.$on('<%=angularAppName%>:<%= entityInstance %>Update', function(event, result) {
            $scope.<%= entityInstance %> = result;
        });
        $scope.$on('$destroy', unsubscribe);

        <%_ if (fieldsContainBlob) { _%>
        $scope.byteSize = DataUtils.byteSize;
        <%_ } _%>
    });
