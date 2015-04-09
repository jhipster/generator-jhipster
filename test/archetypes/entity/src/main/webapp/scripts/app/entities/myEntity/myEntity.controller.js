'use strict';

angular.module('jhipsterApp')
    .controller('MyEntityController', function ($scope, MyEntity, ParseLinks) {
        $scope.myEntitys = [];
        $scope.page = 1;
        $scope.loadAll = function() {
            MyEntity.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.myEntitys = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.create = function () {
            MyEntity.update($scope.myEntity,
                function () {
                    $scope.loadAll();
                    $('#saveMyEntityModal').modal('hide');
                    $scope.clear();
                });
        };

        $scope.update = function (id) {
            MyEntity.get({id: id}, function(result) {
                $scope.myEntity = result;
                $('#saveMyEntityModal').modal('show');
            });
        };

        $scope.delete = function (id) {
            MyEntity.get({id: id}, function(result) {
                $scope.myEntity = result;
                $('#deleteMyEntityConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            MyEntity.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteMyEntityConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.clear = function () {
            $scope.myEntity = {field1: null, id: null};
            $scope.editForm.$setPristine();
            $scope.editForm.$setUntouched();
        };
    });
