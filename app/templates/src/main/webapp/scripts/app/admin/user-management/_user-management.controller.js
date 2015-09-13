'use strict';

angular.module('<%=angularAppName%>')
    .controller('UserManagementController', function ($scope, User, ParseLinks<% if (enableTranslation) { %>, Language<% } %>) {
        $scope.users = [];
        $scope.authorities = ["ROLE_USER", "ROLE_ADMIN"];<% if (enableTranslation) { %>
        Language.getAll().then(function (languages) {
            $scope.languages = languages;
        });<% } %>

        $scope.page = 0;
        $scope.loadAll = function () {<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
            User.query({page: $scope.page, per_page: 20}, function (result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));<% } else { %>
            User.query({}, function (result) {<% } %>
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
            User.update(user, function () {
                $scope.loadAll();
                $scope.clear();
            });
        };

        $scope.showUpdate = function (login) {
            User.get({login: login}, function (result) {
                $scope.user = result;
                $('#saveUserModal').modal('show');
            });
        };

        $scope.save = function () {
            User.update($scope.user,
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
                resetKey: null, authorities: null
            };
            $scope.editForm.$setPristine();
            $scope.editForm.$setUntouched();
        };
    });
