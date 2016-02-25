(function() {
	'use strict';

	angular
		.module('<%=angularAppName%>')
		.controller('UserManagementDeleteController', UserManagementDeleteController);

	UserManagementDeleteController.$inject = ['$uibModalInstance', 'entity', 'User'];

	function UserManagementDeleteController ($uibModalInstance, entity, User) {
		var vm = this;

		vm.user = entity;
		vm.clear = $uibModalInstance.dismiss('cancel');
		vm.confirmDelete = confirmDelete;

		function confirmDelete (login) {
			User.delete({login: login},
				function () {
					$uibModalInstance.close(true);
				});
		}
	}
})();
