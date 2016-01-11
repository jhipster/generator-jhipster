'use strict';

angular.module('<%=angularAppName%>')
	.controller('<%= entityClass %>DeleteController', function($scope, $uibModalInstance, $stateParams, <%= entityClass %>) {

        $scope.<%= entityInstance %> = {id:$stateParams.id};
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
