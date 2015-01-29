'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>Controller', function ($scope, <%= entityClass %><% for (relationshipId in relationships) { %>, <%= relationships[relationshipId].otherEntityNameCapitalized %><% } %>) {
        $scope.<%= entityInstance %>s = [];<% for (relationshipId in relationships) { %>
        $scope.<%= relationships[relationshipId].otherEntityName %>s = <%= relationships[relationshipId].otherEntityNameCapitalized %>.query();<% } %>
        $scope.loadAll = function() {
            <%= entityClass %>.query(function(result) {
               $scope.<%= entityInstance %>s = result;
            });
        };
        $scope.loadAll();

        $scope.create = function () {
            <%= entityClass %>.save($scope.<%= entityInstance %>,
                function () {
                    $scope.loadAll();
                    $('#save<%= entityClass %>Modal').modal('hide');
                    $scope.clear();
                });
        };

        $scope.update = function (id) {
            $scope.<%= entityInstance %> = <%= entityClass %>.get({id: id});
            $('#save<%= entityClass %>Modal').modal('show');
        };

        $scope.delete = function (id) {
            $scope.<%= entityInstance %> = <%= entityClass %>.get({id: id});
            $('#delete<%= entityClass %>Confirmation').modal('show');
        };

        $scope.confirmDelete = function (id) {
            <%= entityClass %>.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#delete<%= entityClass %>Confirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.clear = function () {
            $scope.<%= entityInstance %> = {<% for (fieldId in fields) { %><%= fields[fieldId].fieldName %>: null, <% } %>id: null};
        };
    });
