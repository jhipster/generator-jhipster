(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('UserManagementController', UserManagementController);

    UserManagementController.$inject = ['Principal', 'User', 'ParseLinks', 'paginationConstants'<% if (enableTranslation) { %>, 'Language'<% } %>];

    function UserManagementController(Principal, User, ParseLinks, paginationConstants<% if (enableTranslation) { %>, Language<% } %>) {
        var vm = this;

        vm.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        vm.clear = clear;
        vm.currentAccount = null;
        vm.languages = null;
        vm.links = null;
        vm.loadAll = loadAll;
        vm.loadPage = loadPage;
        vm.page = 1;
        vm.setActive = setActive;
        vm.totalItems = null;
        vm.users = [];


        vm.loadAll();

        <% if (enableTranslation) { %>
        Language.getAll().then(function (languages) {
            vm.languages = languages;
        });<% } %>

        Principal.identity().then(function(account) {
            vm.currentAccount = account;
        });


        function loadAll () {<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
            User.query({page: vm.page - 1, size: paginationConstants.itemsPerPage}, function (result, headers) {
                vm.links = ParseLinks.parse(headers('link'));
                vm.totalItems = headers('X-Total-Count');<% } else { %>
            User.query({}, function (result) {<% } %>
                vm.users = result;
            });
        }

        function loadPage (page) {
            vm.page = page;
            vm.loadAll();
        }

        function setActive (user, isActivated) {
            user.activated = isActivated;
            User.update(user, function () {
                vm.loadAll();
                vm.clear();
            });
        }

        function clear () {
            vm.user = {
                id: null, login: null, firstName: null, lastName: null, email: null,
                activated: null, langKey: null, createdBy: null, createdDate: null,
                lastModifiedBy: null, lastModifiedDate: null, resetDate: null,
                resetKey: null, authorities: null
            };
            vm.editForm.$setPristine();
            vm.editForm.$setUntouched();
        }
    }
})();
