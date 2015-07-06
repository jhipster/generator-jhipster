'use strict';

angular.module('<%=angularAppName%>').controller('<%= entityClass %>DialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', '<%= entityClass %>'<% for (idx in differentTypes) { if (differentTypes[idx] != entityClass) {%>, '<%= differentTypes[idx] %>'<% } } %>,
        function($scope, $stateParams, $modalInstance, entity, <%= entityClass %><% for (idx in differentTypes) { if (differentTypes[idx] != entityClass) {%>, <%= differentTypes[idx] %><% } } %>) {

        $scope.<%= entityInstance %> = entity;<% for (idx in differentTypes) { if (differentTypes[idx] != entityClass) { %>
        $scope.<%= differentTypes[idx].toLowerCase() %>s = <%= differentTypes[idx] %>.query();<% } } %>
        $scope.load = function(id) {
            <%= entityClass %>.get({id : id}, function(result) {
                $scope.<%= entityInstance %> = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('<%=angularAppName%>:<%= entityInstance %>Update', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.<%= entityInstance %>.id != null) {
                <%= entityClass %>.update($scope.<%= entityInstance %>, onSaveFinished);
            } else {
                <%= entityClass %>.save($scope.<%= entityInstance %>, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
