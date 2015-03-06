'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>Controller', function ($scope<% for (idx in differentTypes) { %>, <%= differentTypes[idx] %><% } %><% if (pagination != 'no') { %>, ParseLinks<% } %>) {
        $scope.<%= entityInstance %>s = [];<% for (idx in differentTypes) { if (differentTypes[idx] != entityClass) { %>
        $scope.<%= differentTypes[idx].toLowerCase() %>s = <%= differentTypes[idx] %>.query();<% } } %><% if (pagination == 'pager' || pagination == 'pagination') { %>
        $scope.page = 1;
        $scope.loadAll = function() {
            <%= entityClass %>.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.<%= entityInstance %>s = result;
            });
        };<% } %><% if (pagination == 'infinite-scroll') { %>
        $scope.page = 1;
        $scope.loadAll = function() {
            <%= entityClass %>.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                for (var i = 0; i < result.length; i++) {
                    $scope.<%= entityInstance %>s.push(result[i]);
                }
            });
        };
        $scope.reset = function() {
            $scope.page = 1;
            $scope.<%= entityInstance %>s = [];
            $scope.loadAll();
        };<% } %><% if (pagination != 'no') { %>
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };<% } %><% if (pagination == 'no') { %>
        $scope.loadAll = function() {
            <%= entityClass %>.query(function(result) {
               $scope.<%= entityInstance %>s = result;
            });
        };<% } %>
        $scope.loadAll();

        $scope.create = function () {
            <%= entityClass %>.update($scope.<%= entityInstance %>,
                function () {<% if (pagination != 'infinite-scroll') { %>
                    $scope.loadAll();<% } else { %>
                    $scope.reset();<% } %>
                    $('#save<%= entityClass %>Modal').modal('hide');
                    $scope.clear();
                });
        };

        $scope.update = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
                $scope.<%= entityInstance %> = result;
                $scope.editForm.$setPristine(true);
                $('#save<%= entityClass %>Modal').modal('show');
            });
        };

        $scope.delete = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
                $scope.<%= entityInstance %> = result;
                $('#delete<%= entityClass %>Confirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            <%= entityClass %>.delete({id: id},
                function () {<% if (pagination != 'infinite-scroll') { %>
                    $scope.loadAll();<% } else { %>
                    $scope.reset();<% } %>
                    $('#delete<%= entityClass %>Confirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.clear = function () {
            $scope.<%= entityInstance %> = {<% for (fieldId in fields) { %><%= fields[fieldId].fieldName %>: null, <% } %>id: null};
            $scope.editForm.$setPristine(true);
        };
    });
