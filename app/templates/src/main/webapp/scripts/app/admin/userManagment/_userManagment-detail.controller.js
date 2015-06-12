'use strict';

angular.module('<%=angularAppName%>')
    .controller('UserManagmentDetailController', function ($scope, $stateParams, UserManagment, Authority) {
        $scope.user = {};
        $scope.load = function (id) {
            UserManagment.get({id: id}, function(result) {
                $scope.user = result;
                console.log(result);
            });
        };
        $scope.load($stateParams.id);
    });
