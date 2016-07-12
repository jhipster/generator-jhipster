(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%= entityAngularJSName %>DeleteController',<%= entityAngularJSName %>DeleteController);

    <%= entityAngularJSName %>DeleteController.$inject = ['$uibModalInstance', 'entity', '<%= entityClass %>'];

    function <%= entityAngularJSName %>DeleteController($uibModalInstance, entity, <%= entityClass %>) {
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
