'use strict';

<%= angularAppName %>.controller('<%= entityClass %>Controller', function ($scope, resolved<%= entityClass %>, <%= entityClass %><% for (relationshipId in relationships) { %>, resolved<%= relationships[relationshipId].otherEntityNameCapitalized %><% } %>) {

        $scope.<%= entityInstance %>s = resolved<%= entityClass %>;<% for (relationshipId in relationships) { %>
        $scope.<%= relationships[relationshipId].otherEntityName %>s = resolved<%= relationships[relationshipId].otherEntityNameCapitalized %>;<% } %>

        $scope.create = function () {
            <%= entityClass %>.save($scope.<%= entityInstance %>,
                function () {
                    $scope.<%= entityInstance %>s = <%= entityClass %>.query();
                    $('#save<%= entityClass %>Modal').modal('hide');
                    $scope.clear();
                });
        };

        $scope.update = function (id) {
            $scope.<%= entityInstance %> = <%= entityClass %>.get({id: id});
            $('#save<%= entityClass %>Modal').modal('show');
        };

        $scope.delete = function (id) {
            <%= entityClass %>.delete({id: id},
                function () {
                    $scope.<%= entityInstance %>s = <%= entityClass %>.query();
                });
        };

        $scope.clear = function () {
            $scope.<%= entityInstance %> = {<% for (fieldId in fields) { %><%= fields[fieldId].fieldName %>: null, <% } %>id: null};
        };
    });
