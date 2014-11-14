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

        $scope.update = function (<%=primaryKeyField.fieldName %>) {
            $scope.<%= entityInstance %> = <%= entityClass %>.get({<%=primaryKeyField.fieldName %>: <%=primaryKeyField.fieldName %>});
            $('#save<%= entityClass %>Modal').modal('show');
        };

        $scope.delete = function (<%=primaryKeyField.fieldName %>) {
            <%= entityClass %>.delete({<%=primaryKeyField.fieldName %>: <%=primaryKeyField.fieldName %>},
                function () {
                    $scope.<%= entityInstance %>s = <%= entityClass %>.query();
                });
        };

        $scope.clear = function () {
            $scope.<%= entityInstance %> = {<% for (fieldId in fields) { %><%= fields[fieldId].fieldName %>: null, <% } %><% if (pkManagedByJHipster == true) { %>id: null<% } %>};
        };
    });
