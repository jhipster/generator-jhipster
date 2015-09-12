'use strict';

angular.module('<%=angularAppName%>')
    .controller('UserManagementController', function ($scope, UserManagement, ParseLinks<% if (enableTranslation) { %>, Language, $translate<% } %>) {
        $scope.users = [];
        $scope.roles = UserManagement.authorities();<% if (enableTranslation) { %>
        Language.getAll().then(function (languages) {
            $scope.languages = languages;
        });
        $scope.authorityName = function(name) {
            return $translate.instant('user-management.roles.'+name);
        };<% } else { %>
        $scope.authorityName = function(name) {
            if (name.startsWith("ROLE_") {
                return name.substring(5);
            } else {
                return name;
            }
        };
        <% } %>

        $scope.page = 0;
        $scope.loadAll = function () {
            UserManagement.query({page: $scope.page, per_page: 20}, function (result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.users = result;
            });
        };

        $scope.loadPage = function (page) {
            $scope.page = page;
            $scope.loadAll();
        };
        $scope.loadAll();

        $scope.setActive = function (user, isActivated) {
            user.activated = isActivated;
            UserManagement.update(user, function () {
                $scope.loadAll();
                $scope.clear();
            });
        };

        $scope.showUpdate = function (id) {
            UserManagement.get({id: id}, function (result) {
                $scope.user = result;
                $('#saveUserModal').modal('show');
            });
        };

        $scope.save = function () {
            UserManagement.update($scope.user,
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
            $scope.user = {
                id: null, login: null, firstName: null, lastName: null, email: null,
                activated: null, langKey: null, createdBy: null, createdDate: null,
                lastModifiedBy: null, lastModifiedDate: null, resetDate: null,
                resetKey: null, roles: null
            };
            $scope.editForm.$setPristine();
            $scope.editForm.$setUntouched();
        };
    });
