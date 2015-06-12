'use strict';

angular.module('<%=angularAppName%>')
    .controller('userManagementController', function ($scope, userManagement, Authority, ParseLinks) {
        $scope.users = [];
        $scope.authorities = Authority.query();

        $scope.page = 1;
        $scope.loadAll = function() {
            userManagement.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.users = result;
            });
        };
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.setActive = function (user, isActivated) {
        	user.activated = isActivated;
        	userManagement.update(user, function () {
                $scope.loadAll();
                $scope.clear();
            });
        };

        $scope.showUpdate = function (id) {
            userManagement.get({id: id}, function(result) {
                $scope.user = result;
                $('#saveUserModal').modal('show');
            });
        };

        $scope.save = function () {
            userManagement.update($scope.user,
                function () {
                    $scope.refresh();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $('#saveUserModal').modal('hide');
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.user = { login: null, firstName: null, lastName: null, email: null,
                            activated: null, langKey: null, createdBy: null, createdDate: null,
                            lastModifiedBy: null, lastModifiedDate: null, resetDate: null,
                            resetKey: null, authorities: null };
            $scope.editForm.$setPristine();
            $scope.editForm.$setUntouched();
        };
    });
