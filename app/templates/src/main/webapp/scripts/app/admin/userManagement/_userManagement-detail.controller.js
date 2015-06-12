'use strict';

angular.module('<%=angularAppName%>')
    .controller('userManagementDetailController', function ($scope, $stateParams, userManagement, Authority) {
        $scope.user = {};
        $scope.load = function (id) {
            userManagement.get({id: id}, function(result) {
                $scope.user = result;
                console.log(result);
            });
        };
        $scope.load($stateParams.id);
    });
