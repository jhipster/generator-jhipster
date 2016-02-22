(function () {
  'use strict';

  angular.module('<%=angularAppName%>')
      .controller('ActivationController', function ($scope, $stateParams, Auth, LoginService) {
          Auth.activateAccount({key: $stateParams.key}).then(function () {
              $scope.error = null;
              $scope.success = 'OK';
          }).catch(function () {
              $scope.success = null;
              $scope.error = 'ERROR';
          });

          $scope.login = LoginService.open;
      });
})();
