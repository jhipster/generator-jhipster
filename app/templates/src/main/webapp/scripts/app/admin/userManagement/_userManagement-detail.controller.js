'use strict';

angular.module('<%=angularAppName%>')
    .controller('UserManagementDetailController', function ($scope, $stateParams, UserManagement<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>, Authority<% } %>) {
        $scope.user = {};
        $scope.load = function (id) {
            UserManagement.get({id: id}, function(result) {
                $scope.user = result;
                console.log(result);
            });
        };
        $scope.load($stateParams.id);
    });
