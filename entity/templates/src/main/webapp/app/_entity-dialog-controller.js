(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>.<%= entityClass %>')
        .controller('<%= entityClass %>DialogController', controller);

    controller.$inject = ['$rootScope',
        '$state'<% if (fieldsContainOwnerOneToOne) { %>,
        '$q'<% } %>,
        'entity',
        '<%= entityClass %>'<% for (idx in differentTypes) { if (differentTypes[idx] != entityClass) {%>,
        '<%= differentTypes[idx] %>'<% } } %>];
    /* @ngInject */
    function controller($rootScope,
        $state<% if (fieldsContainOwnerOneToOne) { %>,
        $q<% } %>,
        entity,
        <%= entityClass %><% for (idx in differentTypes) { if (differentTypes[idx] != entityClass) {%>,
        <%= differentTypes[idx] %><% } } %>){

        var vm = this;
        vm.<%= entityInstance %> = entity;<%
            var queries = [];
            for (idx in relationships) {
                var query;
                if (relationships[idx].relationshipType == 'one-to-one' && relationships[idx].ownerSide == true && relationships[idx].otherEntityName != 'user') {
                    query = 'vm.' + relationships[idx].relationshipFieldName.toLowerCase() + 's = ' + relationships[idx].otherEntityNameCapitalized + ".query({filter: '" + relationships[idx].otherEntityRelationshipName.toLowerCase() + "-is-null'});"
                + "\n        $q.all([vm." + relationships[idx].otherEntityRelationshipName + ".$promise, vm." + relationships[idx].relationshipFieldName.toLowerCase() + "s.$promise]).then(function() {"
                + "\n            if (!vm." + relationships[idx].otherEntityRelationshipName + "." + relationships[idx].relationshipFieldName + (dto == 'no' ? ".id" : "Id") + ") {"
                + "\n                return $q.reject();"
                + "\n            }"
                + "\n            return " + relationships[idx].otherEntityNameCapitalized + ".get({id : vm." + relationships[idx].otherEntityRelationshipName + "." + relationships[idx].relationshipFieldName + (dto == 'no' ? ".id" : "Id") + "}).$promise;"
                + "\n        }).then(function(" + relationships[idx].relationshipFieldName + ") {"
                + "\n            vm." + relationships[idx].relationshipFieldName.toLowerCase() + "s.push(" + relationships[idx].relationshipFieldName + ");"
                + "\n        });";
                } else {
                    query = 'vm.' + relationships[idx].otherEntityNameCapitalized.toLowerCase() + 's = ' + relationships[idx].otherEntityNameCapitalized + '.query();';
                }
                if (!util.contains(queries, query)) {
                    queries.push(query);
                }
            } %><% for (idx in queries) { %>
        <%- queries[idx] %><% } %>

        activate();
        function activate() {

        }

        vm.load = function(id) {
            <%= entityClass %>.get({id : id}, function(result) {
                vm.<%= entityInstance %> = result;
            });
        };

        var onSaveFinished = function (result) {
            $rootScope.$emit('<%=angularAppName%>:<%= entityInstance %>Update', result);
            $state.go('<%= entityInstance %>', null, { reload: true });
        };

        vm.save = function () {
            if (vm.<%= entityInstance %>.id != null) {
                <%= entityClass %>.update(vm.<%= entityInstance %>, onSaveFinished);
            } else {
                <%= entityClass %>.save(vm.<%= entityInstance %>, onSaveFinished);
            }
        };

        vm.clear = function() {
        };<% if (fieldsContainBlob) { %>

        vm.abbreviate = function (text) {
            if (!angular.isString(text)) {
                return '';
            }
            if (text.length < 30) {
                return text;
            }
            return text ? (text.substring(0, 15) + '...' + text.slice(-10)) : '';
        };

        vm.byteSize = function (base64String) {
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

        vm.set<%= fields[fieldId].fieldNameCapitalized %> = function ($file, <%= entityInstance %>) {
            <%_ if (fields[fieldId].fieldTypeBlobContent == 'image') { _%>
            if ($file && $file.$error == 'pattern') {
                return;
            }
            <%_ } _%>
            if ($file) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL($file);
                fileReader.onload = function (e) {
                    var base64Data = e.target.result.substr(e.target.result.indexOf('base64,') + 'base64,'.length);
                    vm.$apply(function() {
                        <%= entityInstance %>.<%= fields[fieldId].fieldName %> = base64Data;
                        <%= entityInstance %>.<%= fields[fieldId].fieldName %>ContentType = $file.type;
                    });
                };
            }
        };<% } } %>
    }
})();

