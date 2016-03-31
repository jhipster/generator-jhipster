(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%= entityAngularJSName %>DetailController', <%= entityAngularJSName %>DetailController);

    <%= entityAngularJSName %>DetailController.$inject = ['$scope', '$rootScope', '$stateParams'<% if (fieldsContainBlob) { %>, 'DataUtils'<% } %>, 'entity'<% for (idx in differentTypes) { %>, '<%= differentTypes[idx] %>'<% } %>];

    function <%= entityAngularJSName %>DetailController($scope, $rootScope, $stateParams<% if (fieldsContainBlob) { %>, DataUtils<% } %>, entity<% for (idx in differentTypes) { %>, <%= differentTypes[idx] %><% } %>) {
        var vm = this;
        vm.<%= entityInstance %> = entity;
        
        var unsubscribe = $rootScope.$on('<%=angularAppName%>:<%= entityInstance %>Update', function(event, result) {
            vm.<%= entityInstance %> = result;
        });
        $scope.$on('$destroy', unsubscribe);

        <%_ if (fieldsContainBlob) { _%>
        vm.byteSize = DataUtils.byteSize;
        vm.openFile = DataUtils.openFile;
        <%_ } _%>
    }
})();
