'use strict';

angular.module('<%=angularAppName%>')
    .controller('userManagementDetailController', function ($scope, $stateParams, userManagement, Authority) {
        $scope.user = {};
        $scope.load = function (login) {
            userManagement.get({login: login}, function(result) {
                $scope.user = result;
                console.log(result);
            });
        };
        $scope.load($stateParams.login);
    });
