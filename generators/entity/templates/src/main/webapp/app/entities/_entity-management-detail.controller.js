(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%= entityAngularJSName %>DetailController', <%= entityAngularJSName %>DetailController);

    <%= entityAngularJSName %>DetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState'<% if (fieldsContainBlob) { %>, 'DataUtils'<% } %>, 'entity'<% for (idx in differentTypes) { %>, '<%= differentTypes[idx] %>'<% } %>];

    function <%= entityAngularJSName %>DetailController($scope, $rootScope, $stateParams, previousState<% if (fieldsContainBlob) { %>, DataUtils<% } %>, entity<% for (idx in differentTypes) { %>, <%= differentTypes[idx] %><% } %>) {
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
