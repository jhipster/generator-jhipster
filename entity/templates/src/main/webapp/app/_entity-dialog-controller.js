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
        };<% if (fieldsContainBlob) { %>

        $scope.formatBase64String = function (base64String) {
            if (!angular.isString(base64String)) {
                return base64String;
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
            var bytes = base64String.length / 4 * 3 - paddingSize(base64String);
            var size = bytes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " bytes";

            if (base64String.length < 30) {
                return base64String + ' size:' + size;
            }

            return base64String.substring(0, 10) + '...' + base64String.slice(-10) + ' size:' + size;
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
