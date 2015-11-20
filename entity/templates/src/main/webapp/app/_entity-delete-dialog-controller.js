'use strict';

angular.module('<%=angularAppName%>')
	.controller('<%= entityClass %>DeleteController', function($scope, $modalInstance, entity, <%= entityClass %>) {

        $scope.<%= entityInstance %> = entity;
        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
        $scope.confirmDelete = function (id) {
            <%= entityClass %>.delete({id: id},
                function () {
                    $modalInstance.close(true);
                });
        };

    });