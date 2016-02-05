'use strict';

angular.module('<%=angularAppName%>')
	.controller('<%= entityClass %>ManagementDeleteController', function($scope, $uibModalInstance, entity, <%= entityClass %>) {

        $scope.<%= entityInstance %> = entity;
        $scope.clear = function() {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.confirmDelete = function (id) {
            <%= entityClass %>.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        };

    });
