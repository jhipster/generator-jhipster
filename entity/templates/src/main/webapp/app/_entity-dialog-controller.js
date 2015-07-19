'use strict';

angular.module('<%=angularAppName%>').controller('<%= entityClass %>DialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', '<%= entityClass %>'<% for (idx in differentTypes) { if (differentTypes[idx] != entityClass) {%>, '<%= differentTypes[idx] %>'<% } } %>,
        function($scope, $stateParams, $modalInstance, entity, <%= entityClass %><% for (idx in differentTypes) { if (differentTypes[idx] != entityClass) {%>, <%= differentTypes[idx] %><% } } %>) {

        $scope.<%= entityInstance %> = entity;<%
            var queries = [];
            for (idx in relationships) {
                var query;
                if (relationships[idx].relationshipType == 'one-to-one' && relationships[idx].ownerSide == true) {
                    query = '$scope.' + relationships[idx].relationshipFieldName.toLowerCase() + 's = ' + relationships[idx].otherEntityNameCapitalized + ".query({filter: '" + relationships[idx].otherEntityRelationshipName.toLowerCase() + "-is-null'});";
                } else {
                    query = '$scope.' + relationships[idx].otherEntityNameCapitalized.toLowerCase() + 's = ' + relationships[idx].otherEntityNameCapitalized + '.query();';
                }
                if (!util.contains(queries, query)) {
                    queries.push(query);
                }
            } %><% for (idx in queries) { %>
        <%- queries[idx] %><% } %>
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
        };<% } %><% for (fieldId in fields) { if (fields[fieldId].fieldType === 'byte[]') { %>

        $scope.set<%= fields[fieldId].fieldNameCapitalized %> = function ($files, <%= entityInstance %>) {
            if ($files[0]) {
                var file = $files[0];
                var fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                fileReader.onload = function (e) {
                    var data = e.target.result;
                    var base64Data = data.substr(data.indexOf('base64,') + 'base64,'.length);
                    $scope.$apply(function() {
                        <%= entityInstance %>.<%= fields[fieldId].fieldName %> = base64Data;
                    });
                };
            }
        };<% } } %>
}]);
