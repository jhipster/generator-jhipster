(function() {
	'use strict';

	angular
		.module('<%=angularAppName%>')
		.controller('<%= entityClass %>ManagementDeleteController',<%= entityClass %>ManagementDeleteController);

	<%= entityClass %>ManagementDeleteController.$inject = ['$uibModalInstance', 'entity', '<%= entityClass %>'];

	function <%= entityClass %>ManagementDeleteController($uibModalInstance, entity, <%= entityClass %>) {
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
