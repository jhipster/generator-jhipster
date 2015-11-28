'use strict';

angular.module('<%=angularAppName%>').controller('UserManagementDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'User', <% if (enableTranslation) { %>'Language',<% } %>
        function($scope, $stateParams, $uibModalInstance, entity, User<% if (enableTranslation) { %>, Language<% } %>) {

        $scope.user = entity;
        $scope.authorities = ["ROLE_USER", "ROLE_ADMIN"];
        <%_ if (enableTranslation) { _%>
        Language.getAll().then(function (languages) {
            $scope.languages = languages;
        });
        <%_ } _%>
        var onSaveSuccess = function (result) {
            $scope.isSaving = false;
            $uibModalInstance.close(result);
        };

        var onSaveError = function (result) {
            $scope.isSaving = false;
        };

        $scope.save = function () {
            $scope.isSaving = true;
            if ($scope.user.id != null) {
                User.update($scope.user, onSaveSuccess, onSaveError);
            } else {<% if (!enableTranslation){ %>
                $scope.user.langKey = 'en';<% } %>
                User.save($scope.user, onSaveSuccess, onSaveError);
            }
        };

        $scope.clear = function() {
            $uibModalInstance.dismiss('cancel');
        };
}]);
