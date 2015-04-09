'use strict';

angular.module('jhipsterApp')
    .controller('MyEntityDetailController', function ($scope, $stateParams, MyEntity) {
        $scope.myEntity = {};
        $scope.load = function (id) {
            MyEntity.get({id: id}, function(result) {
              $scope.myEntity = result;
            });
        };
        $scope.load($stateParams.id);
    });
