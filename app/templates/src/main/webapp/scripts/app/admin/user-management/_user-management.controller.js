'use strict';

angular.module('<%=angularAppName%>')
    .controller('UserManagementController', function ($scope, User, UsersSearch, ParseLinks<% if (enableTranslation) { %>, Language<% } %>) {
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
				$scope.total = headers('x-total-count');
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

        $scope.clear = function () {
            $scope.user = {
                id: null, login: null, firstName: null, lastName: null, email: null,
                activated: null, langKey: null, createdBy: null, createdDate: null,
                lastModifiedBy: null, lastModifiedDate: null, resetDate: null,
                resetKey: null, authorities: null
            };
        };

		$scope.search = function () {
            UsersSearch.query({
                query: $scope.searchQuery
            }, (function (result) {
                $scope.users = result;
            }), function (response) {
                if (response.status === 404) {
                    $scope.loadAll();
                }
            });
        };

		$scope.areAllUsersSelected = false;

        $scope.updateUsersSelection = function (userArray, selectionValue) {
            for (var i = 0; i < userArray.length; i++)
            {
                userArray[i].isSelected = selectionValue;
            }
        };

        $scope.import = function (){
            for (var i = 0; i < $scope.users.length; i++){
                var user = $scope.users[i];
                if(user.isSelected){
                    //User.update(user);
                    //TODO: handle bulk import
                }
            }
        };

        $scope.export = function (){
            for (var i = 0; i < $scope.users.length; i++){
                var user = $scope.users[i];
                if(user.isSelected){
                    //User.update(user);
                    //TODO: handle bulk export
                }
            }
        };

        $scope.deleteSelected = function (){
            for (var i = 0; i < $scope.users.length; i++){
                var user = $scope.users[i];
                if(user.isSelected){
                    //User.delete(user);
                    //user deletion deliberately disabled
                }
            }
        };

        $scope.sync = function (){
            for (var i = 0; i < $scope.users.length; i++){
                var user = $scope.users[i];
                if(user.isSelected){
                    User.update(user);
                }
            }
        };

        $scope.order = function (predicate, reverse) {
            $scope.predicate = predicate;
            $scope.reverse = reverse;
            User.query({page: $scope.page, per_page: 20}, function (result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.users = result;
                $scope.total = headers('x-total-count');
            });

        };
    });
