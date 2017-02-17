(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%= entityAngularName %>DeleteController',<%= entityAngularName %>DeleteController);

    <%= entityAngularName %>DeleteController.$inject = ['$uibModalInstance', 'entity', '<%= entityClass %>'];

    function <%= entityAngularName %>DeleteController($uibModalInstance, entity, <%= entityClass %>) {
        var vm = this;

        vm.<%= entityInstance %> = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            <%= entityClass %>.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        }
    }
})();
