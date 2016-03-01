(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%= entityAngularJSName %>DeleteController',<%= entityAngularJSName %>DeleteController);

    <%= entityAngularJSName %>DeleteController.$inject = ['$uibModalInstance', 'entity', '<%= entityClass %>'];

    function <%= entityAngularJSName %>DeleteController($uibModalInstance, entity, <%= entityClass %>) {
        var vm = this;
        vm.<%= entityInstance %> = entity;
        vm.clear = function() {
            $uibModalInstance.dismiss('cancel');
        };
        vm.confirmDelete = function (id) {
            <%= entityClass %>.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        };
    }
})();
