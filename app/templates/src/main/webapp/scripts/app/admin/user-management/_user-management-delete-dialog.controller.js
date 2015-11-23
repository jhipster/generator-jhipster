'use strict';

angular.module('<%=angularAppName%>')
	.controller('user-managementDeleteController', function($scope, $modalInstance, entity, User) {

        $scope.user = entity;
        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
        $scope.confirmDelete = function (login) {
            User.delete({login: login},
                function () {
                    $modalInstance.close(true);
                });
        };

    });
