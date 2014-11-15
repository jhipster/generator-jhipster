'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/<%= entityInstance %>', {
                templateUrl: 'client/app/entities/<%= entityInstance %>/<%= entityInstance %>s.html',
                controller: '<%= entityClass %>Controller',
                authenticate: true
            })
    })
    .controller('<%= entityClass %>Controller', function ($scope, <%= entityClass %><% for (relationshipId in relationships) { %>, <%= relationships[relationshipId].otherEntityNameCapitalized %><% } %>) {
        $scope.<%= entityInstance %>s = <%= entityClass %>.query();<% for (relationshipId in relationships) { %>
        $scope.<%= relationships[relationshipId].otherEntityName %>s = <%= relationships[relationshipId].otherEntityNameCapitalized %>.query();<% } %>

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
