'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>Controller', function ($scope, <%= entityClass %><% if (searchEngine == 'elasticsearch') { %>, <%= entityClass %>Search<% } %><% if (pagination != 'no') { %>, ParseLinks<% } %>) {
        $scope.<%= entityInstance %>s = [];<% if (pagination == 'pager' || pagination == 'pagination') { %>
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
        };<% if (searchEngine == 'elasticsearch') { %>

        $scope.search = function () {
            <%= entityClass %>Search.query({query: $scope.searchQuery}, function(result) {
                $scope.<%= entityInstance %>s = result;
            }, function(response) {
                if(response.status === 404) {
                    $scope.loadAll();
                }
            });
        };<% } %>

        $scope.refresh = function () {<% if (pagination != 'infinite-scroll') { %>
            $scope.loadAll();<% } else { %>
            $scope.reset();<% } %>
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.<%= entityInstance %> = {<% for (fieldId in fields) { %><%= fields[fieldId].fieldName %>: null, <% } %>id: null};
        };<% if (fieldsContainBlob) { %>

        $scope.abbreviate = function (text) {
            if (!angular.isString(text)) {
                return '';
            }
            if (text.length < 30) {
                return text;
            }
            return text ? (text.substring(0, 15) + '...' + text.slice(-10)) : '';
        };

        $scope.byteSize = function (base64String) {
            if (!angular.isString(base64String)) {
                return '';
            }
            function endsWith(suffix, str) {
                return str.indexOf(suffix, str.length - suffix.length) !== -1;
            }
            function paddingSize(base64String) {
                if (endsWith('==', base64String)) {
                    return 2;
                }
                if (endsWith('=', base64String)) {
                    return 1;
                }
                return 0;
            }
            function size(base64String) {
                return base64String.length / 4 * 3 - paddingSize(base64String);
            }
            function formatAsBytes(size) {
                return size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " bytes";
            }

            return formatAsBytes(size(base64String));
        };<% } %>
    });
