<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%= entityAngularName %>DetailController', <%= entityAngularName %>DetailController);

    <%= entityAngularName %>DetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState'<% if (fieldsContainBlob) { %>, 'DataUtils'<% } %>, 'entity'<% for (idx in differentTypes) { %>, '<%= differentTypes[idx] %>'<% } %>];

    function <%= entityAngularName %>DetailController($scope, $rootScope, $stateParams, previousState<% if (fieldsContainBlob) { %>, DataUtils<% } %>, entity<% for (idx in differentTypes) { %>, <%= differentTypes[idx] %><% } %>) {
        var vm = this;

        vm.<%= entityInstance %> = entity;
        vm.previousState = previousState.name;
        <%_ if (fieldsContainBlob) { _%>
        vm.byteSize = DataUtils.byteSize;
        vm.openFile = DataUtils.openFile;
        <%_ } _%>

        var unsubscribe = $rootScope.$on('<%=angularAppName%>:<%= entityInstance %>Update', function(event, result) {
            vm.<%= entityInstance %> = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
