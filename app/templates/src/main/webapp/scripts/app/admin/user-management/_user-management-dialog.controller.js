'use strict';

angular.module('<%=angularAppName%>').controller('UserManagementDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'User',
        function($scope, $stateParams, $modalInstance, entity, User) {

        $scope.user = entity;

        var onSaveSuccess = function (result) {
            $scope.isSaving = false;
            $modalInstance.close(result);
        };

        var onSaveError = function (result) {
            $scope.isSaving = false;
        };

        $scope.save = function () {
            $scope.isSaving = true;
            if ($scope.user.id != null) {
                User.update($scope.user, onSaveSuccess, onSaveError);
            } else {
                User.save($scope.user, onSaveSuccess, onSaveError);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
